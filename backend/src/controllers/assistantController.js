const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const Destination = require("../models/Destination");

const DEFAULT_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];

const chatWithAssistant = async (req, res) => {
  const { message, history = [], tripContext = {} } = req.body;

  if (typeof message !== "string" || !message.trim() || message.length > 1200) {
    return res.status(400).json({
      success: false,
      message: "Message must contain 1 to 1200 characters.",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "The AI assistant is not configured. Add GEMINI_API_KEY to backend/.env.",
    });
  }

  const destinationIds = Array.isArray(tripContext.destinationIds)
    ? tripContext.destinationIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .slice(0, 20)
    : [];
  const destinationQuery = destinationIds.length
    ? { _id: { $in: destinationIds } }
    : {};
  let destinations;

  try {
    destinations = await Destination.find(destinationQuery)
      .select("name city category duration price highlights")
      .limit(40)
      .lean();
  } catch (error) {
    console.error("Trip assistant destination lookup failed:", error.message);
    return res.status(503).json({
      success: false,
      message: "The trip assistant could not load Jordan destination details. Please try again.",
    });
  }

  const historyItems = Array.isArray(history)
    ? history
        .filter(
          (item) =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
        )
        .slice(-10)
    : [];
  const firstUserIndex = historyItems.findIndex((item) => item.role === "user");
  const safeHistory = [];

  for (const item of historyItems.slice(firstUserIndex < 0 ? historyItems.length : firstUserIndex)) {
    const role = item.role === "assistant" ? "model" : "user";
    const content = item.content.slice(0, 1200);
    const previous = safeHistory[safeHistory.length - 1];

    if (previous?.role === role) {
      previous.parts[0].text = `${previous.parts[0].text}\n${content}`.slice(-1200);
    } else {
      safeHistory.push({ role, parts: [{ text: content }] });
    }
  }

  if (safeHistory[safeHistory.length - 1]?.role === "user") {
    safeHistory.pop();
  }
  if (safeHistory.length > 8) {
    safeHistory.splice(0, safeHistory.length - 8);
    if (safeHistory[0]?.role === "model") safeHistory.shift();
  }

  const context = {
    startDate:
      typeof tripContext.startDate === "string"
        ? tripContext.startDate.slice(0, 40)
        : "",
    endDate:
      typeof tripContext.endDate === "string"
        ? tripContext.endDate.slice(0, 40)
        : "",
    notes:
      typeof tripContext.notes === "string"
        ? tripContext.notes.slice(0, 500)
        : "",
    selectedDestinations: destinations.map((destination) => ({
      name: destination.name,
      city: destination.city,
      category: destination.category,
      duration: destination.duration,
      highlights: destination.highlights,
      estimatedPriceJod: destination.price,
    })),
  };

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contents = [
    ...safeHistory,
    {
      role: "user",
      parts: [
        {
          text: `Current trip context (JSON): ${JSON.stringify(context)}\n\nTraveler message: ${message.trim()}`,
        },
      ],
    },
  ];
  const config = {
    systemInstruction:
      "You are Discover Jordan's travel-planning assistant. Help the signed-in traveler create practical itineraries in Jordan using the destination catalog provided in the user's trip context. Ask concise follow-up questions when important details are missing. Be clear that prices are estimates and that visitors must verify opening hours, transport, safety, and booking details with official sources. Do not claim to make reservations or payments.",
    maxOutputTokens: 700,
    temperature: 0.6,
  };
  const configuredModel = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const modelCandidates = [...new Set([configuredModel, ...FALLBACK_MODELS])];
  let completion;

  try {
    const generateContent = (model) =>
      client.models.generateContent({ model, contents, config });

    for (const [index, model] of modelCandidates.entries()) {
      try {
        completion = await generateContent(model);
        break;
      } catch (error) {
        const status = Number(error.status || error.statusCode);
        const canRetry = status === 404 || status === 429 || status >= 500;
        if (!canRetry || index === modelCandidates.length - 1) {
          throw error;
        }

        console.warn(
          `Gemini model "${model}" returned status ${status}; trying the next supported model.`
        );
      }
    }

    const reply = completion.text?.trim();

    if (!reply) {
      return res.status(502).json({
        success: false,
        message: "Gemini returned an empty reply. Please try again.",
      });
    }

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Gemini trip assistant request failed:", error.message);
    const status = Number(error.status || error.statusCode);
    const message =
      status === 401 || status === 403
        ? "The AI provider rejected its server configuration. Please contact site support."
        : status === 429
          ? "The AI assistant has reached its current usage limit. Please try again later."
          : status === 404
            ? "No configured Gemini model is available for this API key. Please contact site support to check the model and API access."
            : "The AI trip assistant could not complete that request. Please try again.";
    return res.status(status === 429 ? 503 : 502).json({
      success: false,
      message,
    });
  }
};

module.exports = { chatWithAssistant };
