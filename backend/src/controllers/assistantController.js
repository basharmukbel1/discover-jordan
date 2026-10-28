const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const Destination = require("../models/Destination");

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

  try {
    const destinationIds = Array.isArray(tripContext.destinationIds)
      ? tripContext.destinationIds
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .slice(0, 20)
      : [];
    const destinationQuery = destinationIds.length
      ? { _id: { $in: destinationIds } }
      : {};
    const destinations = await Destination.find(destinationQuery)
      .select("name city category duration price highlights")
      .limit(20)
      .lean();

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string"
          )
          .slice(-8)
          .map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content.slice(0, 1200) }],
          }))
      : [];

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
    const completion = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [
        ...safeHistory,
        {
          role: "user",
          parts: [
            {
              text: `Current trip context (JSON): ${JSON.stringify(context)}\n\nTraveler message: ${message.trim()}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          "You are Discover Jordan's travel-planning assistant. Help the signed-in traveler create practical itineraries in Jordan using the destination catalog provided in the user's trip context. Ask concise follow-up questions when important details are missing. Be clear that prices are estimates and that visitors must verify opening hours, transport, safety, and booking details with official sources. Do not claim to make reservations or payments.",
        maxOutputTokens: 700,
        temperature: 0.6,
      },
    });

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
    return res.status(502).json({
      success: false,
      message: "The AI trip assistant is temporarily unavailable. Please try again.",
    });
  }
};

module.exports = { chatWithAssistant };
