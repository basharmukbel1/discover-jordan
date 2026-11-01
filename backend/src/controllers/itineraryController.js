const { GoogleGenAI } = require("@google/genai");
const Destination = require("../models/Destination");

const DEFAULT_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];
const GOVERNORATES = [
  "Ajloun",
  "Amman",
  "Aqaba",
  "Balqa",
  "Irbid",
  "Jerash",
  "Karak",
  "Mafraq",
  "Madaba",
  "Ma'an",
  "Tafilah",
  "Zarqa",
];
const ACTIVITIES = ["Hiking", "Museums", "Nature", "Historical", "Relaxation"];
const BUDGET_TIERS = ["budget", "moderate", "premium"];
const PACES = ["relaxed", "moderate", "action_packed"];
const TRAVEL_COMPANIONS = ["solo", "couple", "family_with_kids", "friends"];
const TRANSPORTATION_METHODS = ["rental_car", "public_transit_jett", "taxi_private_driver"];
const STARTING_POINTS = ["amman_qaia", "aqaba"];
const ACCOMMODATION_STYLES = ["budget", "mid_range", "luxury", "eco_lodges_camps"];

const isStringList = (value, allowedValues) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= allowedValues.length &&
  value.every((item) => allowedValues.includes(item)) &&
  new Set(value).size === value.length;

const isIsoDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const cleanItinerary = (value, startDate, expectedDays, governorates, activities, catalog) => {
  if (
    !value ||
    typeof value.title !== "string" ||
    typeof value.summary !== "string" ||
    !Array.isArray(value.days) ||
    value.days.length !== expectedDays ||
    !Array.isArray(value.travelTips) ||
    typeof value.estimatedBudgetJod !== "number"
  ) {
    return null;
  }

  const days = value.days.map((day, index) => {
    const expectedDate = new Date(`${startDate}T00:00:00Z`);
    expectedDate.setUTCDate(expectedDate.getUTCDate() + index);
    const expectedDateString = expectedDate.toISOString().slice(0, 10);
    if (
      !day ||
      day.day !== index + 1 ||
      day.date !== expectedDateString ||
      typeof day.title !== "string" ||
      typeof day.region !== "string" ||
      !governorates.includes(day.region) ||
      !Array.isArray(day.activities) ||
      day.activities.length < 2
    ) {
      return null;
    }
    const cleanedActivities = day.activities.map((activity) => {
      if (
        !activity ||
        typeof activity.time !== "string" ||
        typeof activity.title !== "string" ||
        typeof activity.description !== "string" ||
        typeof activity.destination !== "string" ||
        !catalog.some((place) => place.name === activity.destination && place.region === day.region) ||
        !activities.includes(activity.activityType) ||
        typeof activity.transport !== "string" ||
        typeof activity.bookingTip !== "string" ||
        !Number.isFinite(activity.estimatedCostJod)
      ) {
        return null;
      }
      return {
        time: activity.time.slice(0, 30),
        title: activity.title.slice(0, 120),
        description: activity.description.slice(0, 500),
        destination: activity.destination.slice(0, 120),
        activityType: activity.activityType,
        estimatedCostJod: Math.max(0, activity.estimatedCostJod),
        transport: activity.transport.slice(0, 250),
        bookingTip: activity.bookingTip.slice(0, 250),
      };
    });
    if (cleanedActivities.some((activity) => !activity)) return null;
    return {
      day: day.day,
      date: day.date.slice(0, 10),
      title: day.title.slice(0, 120),
      region: day.region.slice(0, 100),
      activities: cleanedActivities,
    };
  });

  if (days.some((day) => !day)) return null;
  return {
    title: value.title.slice(0, 140),
    summary: value.summary.slice(0, 1000),
    estimatedBudgetJod: Math.max(0, value.estimatedBudgetJod),
    travelTips: value.travelTips
      .filter((tip) => typeof tip === "string")
      .slice(0, 12)
      .map((tip) => tip.slice(0, 300)),
    days,
  };
};

const generateItinerary = async (req, res) => {
  const preferences = req.body || {};
  const {
    governorates,
    activities,
    budgetTier,
    startDate,
    endDate,
    pace,
    travelCompanions,
    transportationMethod,
    startingPoint,
    accommodationStyle,
  } = preferences;

  if (
    !isStringList(governorates, GOVERNORATES) ||
    !isStringList(activities, ACTIVITIES) ||
    !BUDGET_TIERS.includes(budgetTier) ||
    !PACES.includes(pace) ||
    !TRAVEL_COMPANIONS.includes(travelCompanions) ||
    !TRANSPORTATION_METHODS.includes(transportationMethod) ||
    !STARTING_POINTS.includes(startingPoint) ||
    !ACCOMMODATION_STYLES.includes(accommodationStyle) ||
    !isIsoDate(startDate) ||
    !isIsoDate(endDate)
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide valid regions, activities, travel style, starting point, budget, dates, and pace.",
    });
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const durationDays = Math.floor((end - start) / 86400000) + 1;
  if (durationDays < 1 || durationDays > 14) {
    return res.status(400).json({
      success: false,
      message: "Choose travel dates for a trip lasting between 1 and 14 days.",
    });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "The AI planner is not configured. Contact site support.",
    });
  }

  let catalog;
  try {
    catalog = await Destination.find({})
      .select("name city region category duration price highlights")
      .limit(100)
      .lean();
  } catch (error) {
    console.error("Loading destination catalog for itinerary failed:", error.message);
    return res.status(503).json({
      success: false,
      message: "Could not load Jordan destination details. Please try again.",
    });
  }

  const selectedCatalog = catalog.filter((place) => governorates.includes(place.region));
  if (!selectedCatalog.length) {
    return res.status(422).json({
      success: false,
      message: "There are no catalog destinations for those regions yet. Please choose another governorate.",
    });
  }
  const catalogForPrompt = selectedCatalog.map((place) => ({
    name: place.name,
    city: place.city,
    governorate: place.region,
    category: place.category,
    suggestedDuration: place.duration,
    estimatedEntryCostJod: place.price,
    highlights: place.highlights,
  }));
  const prompt = [
    "Create a practical day-by-day, hour-by-hour travel itinerary exclusively for Jordan.",
    "The traveler wants a local Jordan tourism expert. Use their preferences and the destination catalog below.",
    "Use only the traveler-selected governorates and activity types. Do not add stops in unselected regions or activities outside their selected interests. Keep the day region exactly equal to one of the selected governorate names.",
    "Use exact destination names from the Jordan destination catalog below. Do not add destinations outside that catalog or claim live availability. Cluster nearby places, account for realistic travel time, meals, rest, daylight, and seasonal/safety considerations.",
    `Transportation is fixed to "${transportationMethod}". Make every activity's "transport" field specific to this choice. For public_transit_jett, use JETT/public buses only where a route is known to serve the journey; never suggest renting or driving a car, and explain realistic taxi/walking last-mile connections or when service is unavailable. For taxi_private_driver, plan door-to-door taxi/private-driver transfers and do not assume a rental car. For rental_car, give practical self-drive directions and parking/road-time guidance; do not make public buses the primary plan.`,
    `The traveler arrives at "${startingPoint}". Make Day 1 geographically realistic from that origin: favor a selected-region stop reachable from the arrival point, or explicitly schedule the transfer to the first selected region and keep sightseeing light when the journey is long. Never imply an instant cross-country transfer.`,
    `Travel companions: "${travelCompanions}". Tailor activity suitability and breaks accordingly. If family_with_kids, prioritize child-friendly, lower-risk options, shorter walks, shade, restrooms, and frequent breaks; do not recommend strenuous canyon hikes, exposed routes, or hazardous activities for children. For friends, consider group-friendly activities; for couples, include suitable shared experiences; for solo travelers, favor straightforward, well-supported activities.`,
    `Travel pace is "${pace}". relaxed means few stops, generous breaks, and unhurried transitions; moderate means a balanced number of stops and downtime; action_packed means fuller days only when travel times, daylight, and safety allow. Do not make any day unrealistically dense.`,
    `Accommodation style is "${accommodationStyle}". Recommend overnight stays that fit this style and the selected regions. Match lodging references in travelTips to this preference, while keeping spending estimates consistent with budget tier "${budgetTier}". For eco_lodges_camps, suggest suitable nature lodges or established camps only where available and do not invent specific properties.`,
    "Return only valid JSON with exactly this shape:",
    '{"title":"string","summary":"string","estimatedBudgetJod":number,"travelTips":["string"],"days":[{"day":1,"date":"YYYY-MM-DD","title":"string","region":"selected governorate name","activities":[{"time":"HH:MM","title":"string","description":"string","destination":"exact catalog place name","activityType":"one selected activity type","estimatedCostJod":number,"transport":"string","bookingTip":"string"}]}]}',
    `The days array must contain exactly ${durationDays} days, one for each date from ${startDate} through ${endDate}. Every day must have at least two activities. Estimated costs are per person in JOD.`,
    `Traveler preferences: ${JSON.stringify({ governorates, activities, budgetTier, startDate, endDate, pace, travelCompanions, transportationMethod, startingPoint, accommodationStyle })}`,
    `Jordan destination catalog: ${JSON.stringify(catalogForPrompt)}`,
  ].join("\n\n");
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = [
    ...new Set([
      process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
      ...FALLBACK_MODELS,
    ]),
  ];

  try {
    let response;
    for (const [index, model] of models.entries()) {
      try {
        response = await client.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction:
              "You are a careful Jordan-based local trip planner. Your itinerary must be feasible, welcoming, culturally respectful, and accurate about uncertainty. Never fabricate exact prices, schedules, trail conditions, or opening hours. Return JSON only.",
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
            temperature: 0.4,
          },
        });
        break;
      } catch (error) {
        const status = Number(error.status || error.statusCode);
        const canRetry = status === 404 || status === 429 || status >= 500;
        if (!canRetry || index === models.length - 1) throw error;
        console.warn(`Gemini itinerary model "${model}" returned ${status}; trying the next model.`);
      }
    }

    let generated;
    try {
      generated = JSON.parse(response.text || "");
    } catch {
      return res.status(502).json({
        success: false,
        message: "The AI returned an unreadable itinerary. Please try generating it again.",
      });
    }
    const itinerary = cleanItinerary(generated, startDate, durationDays, governorates, activities, selectedCatalog);
    if (!itinerary) {
      return res.status(502).json({
        success: false,
        message: "The AI itinerary did not match the required schedule format. Please try again.",
      });
    }
    return res.status(200).json({ success: true, itinerary });
  } catch (error) {
    console.error("Generating Jordan itinerary failed:", error.message);
    const status = Number(error.status || error.statusCode);
    const message = status === 401 || status === 403
      ? "The AI provider rejected its server configuration. Contact site support."
      : status === 429
        ? "The AI planner has reached its current usage limit. Try again later."
        : status === 404
          ? "No configured Gemini model is available for this API key. Contact site support."
          : "Could not generate your itinerary right now. Please try again.";
    return res.status(status === 429 ? 503 : 502).json({ success: false, message });
  }
};

module.exports = { generateItinerary };
