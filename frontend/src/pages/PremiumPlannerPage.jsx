import { useMemo, useState } from "react";
import api from "../api";

const governorates = [
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
const activityOptions = ["Hiking", "Museums", "Nature", "Historical", "Relaxation"];
const budgetOptions = [
  { value: "budget", label: "Budget", detail: "Local meals, public transport, and free experiences" },
  { value: "moderate", label: "Comfort", detail: "A balanced mix of local favorites and convenience" },
  { value: "premium", label: "Premium", detail: "More private transport and upgraded experiences" },
];
const companionOptions = [
  { value: "solo", label: "Solo", detail: "A flexible trip planned for one traveler" },
  { value: "couple", label: "Couple", detail: "Shared experiences with time together" },
  { value: "family_with_kids", label: "Family with kids", detail: "Family-friendly stops, breaks, and easier activities" },
  { value: "friends", label: "Friends", detail: "Shared adventures and group-friendly activities" },
];
const transportationOptions = [
  { value: "rental_car", label: "Renting a car", detail: "Self-drive routes, parking, and realistic road times" },
  { value: "public_transit_jett", label: "Public Transit / JETT", detail: "Bus routes where available and practical last-mile options" },
  { value: "taxi_private_driver", label: "Taxi / Private Driver", detail: "Door-to-door rides and transfer guidance" },
];
const startingPointOptions = [
  { value: "amman_qaia", label: "Amman / QAIA", detail: "Start from Amman or Queen Alia International Airport" },
  { value: "aqaba", label: "Aqaba", detail: "Start from Aqaba and its airport or city" },
];
const accommodationOptions = [
  { value: "budget", label: "Budget", detail: "Simple, good-value stays" },
  { value: "mid_range", label: "Mid-range", detail: "Comfortable hotels and guesthouses" },
  { value: "luxury", label: "Luxury", detail: "Upscale hotels and distinctive stays" },
  { value: "eco_lodges_camps", label: "Eco-lodges / Camps", detail: "Nature stays and desert camps" },
];
const paceOptions = [
  { value: "relaxed", label: "Relaxed", detail: "Fewer stops, more time to unwind" },
  { value: "moderate", label: "Moderate", detail: "A thoughtful mix of sights and downtime" },
  { value: "action_packed", label: "Action-packed", detail: "See more with full, active days" },
];

const dateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const today = dateString(new Date());
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const initialPreferences = {
  governorates: [],
  activities: [],
  budgetTier: "moderate",
  startDate: today,
  endDate: dateString(tomorrow),
  travelCompanions: "solo",
  transportationMethod: "rental_car",
  startingPoint: "amman_qaia",
  accommodationStyle: "mid_range",
  pace: "moderate",
};
const toggleValue = (values, value) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export default function PremiumPlannerPage() {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [step, setStep] = useState(0);
  const [itinerary, setItinerary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const maximumEndDate = useMemo(() => {
    const start = new Date(`${preferences.startDate}T00:00:00`);
    start.setDate(start.getDate() + 13);
    return dateString(start);
  }, [preferences.startDate]);

  const nextStep = () => {
    setError("");
    if (step === 0 && !preferences.governorates.length) {
      setError("Choose at least one governorate to continue.");
      return;
    }
    if (step === 1 && !preferences.activities.length) {
      setError("Choose at least one activity to continue.");
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
  };

  const generate = async (event) => {
    event.preventDefault();
    setError("");
    setGenerating(true);
    try {
      const { data } = await api.post("/api/generate-itinerary", preferences);
      setItinerary(data.itinerary);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not generate your itinerary. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="premium-page">
      <header className="premium-heading">
        <p className="eyebrow mb-2">Discover Jordan · Free AI Trip Planner</p>
        <h1 className="display-6 fw-bold">{itinerary ? "Your Jordan itinerary" : "Let’s plan your Jordan trip"}</h1>
        <p className="text-secondary mb-0">
          {itinerary
            ? "A personalized route shaped around your interests, travel party, transport, stay, and dates."
            : "Tell us who is traveling, how you want to get around, and what you enjoy. Gemini will tailor your Jordan itinerary."}
        </p>
      </header>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {itinerary ? (
        <ItineraryView
          itinerary={itinerary}
          onEdit={() => { setItinerary(null); setStep(0); }}
        />
      ) : (
        <div className="premium-wizard card">
          <div className="card-body p-4 p-lg-5">
            <div className="premium-stepper mb-4" aria-label={`Step ${step + 1} of 4`}>
              {["Regions", "Interests", "Travel style", "Trip details"].map((label, index) => (
                <div className={`premium-step ${index <= step ? "active" : ""}`} key={label}>
                  <span>{index + 1}</span>{label}
                </div>
              ))}
            </div>

            <form onSubmit={step === 3 ? generate : (event) => { event.preventDefault(); nextStep(); }}>
              {step === 0 && (
                <section>
                  <h2 className="h3 fw-bold">Where in Jordan would you like to go?</h2>
                  <p className="text-secondary">Pick one or more governorates. Your itinerary will stay within the regions you select.</p>
                  <div className="premium-choice-grid">
                    {governorates.map((governorate) => (
                      <button
                        key={governorate}
                        type="button"
                        aria-pressed={preferences.governorates.includes(governorate)}
                        className={`premium-choice ${preferences.governorates.includes(governorate) ? "selected" : ""}`}
                        onClick={() => setPreferences((current) => ({
                          ...current,
                          governorates: toggleValue(current.governorates, governorate),
                        }))}
                      >
                        <span className="premium-choice-check" aria-hidden="true">
                          {preferences.governorates.includes(governorate) ? "✓" : "+"}
                        </span>
                        {governorate}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {step === 1 && (
                <section>
                  <h2 className="h3 fw-bold">What would make this trip special?</h2>
                  <p className="text-secondary">Choose as many interests as you like. Your plan will focus on these activities.</p>
                  <div className="premium-interest-grid">
                    {activityOptions.map((activity) => (
                      <button
                        key={activity}
                        type="button"
                        aria-pressed={preferences.activities.includes(activity)}
                        className={`premium-interest ${preferences.activities.includes(activity) ? "selected" : ""}`}
                        onClick={() => setPreferences((current) => ({
                          ...current,
                          activities: toggleValue(current.activities, activity),
                        }))}
                      >
                        <span className="premium-interest-mark" aria-hidden="true">
                          {preferences.activities.includes(activity) ? "✓" : "+"}
                        </span>
                        <span className="fw-semibold">{activity}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <h2 className="h3 fw-bold">Who’s traveling and how?</h2>
                  <p className="text-secondary">These details help tailor activity difficulty, transfers, and overnight stays.</p>
                  <ChoiceGroup
                    title="Travel companions"
                    options={companionOptions}
                    value={preferences.travelCompanions}
                    onChange={(travelCompanions) => setPreferences((current) => ({ ...current, travelCompanions }))}
                  />
                  <ChoiceGroup
                    title="Transportation method"
                    options={transportationOptions}
                    value={preferences.transportationMethod}
                    onChange={(transportationMethod) => setPreferences((current) => ({ ...current, transportationMethod }))}
                  />
                  <ChoiceGroup
                    title="Starting point / arrival"
                    options={startingPointOptions}
                    value={preferences.startingPoint}
                    onChange={(startingPoint) => setPreferences((current) => ({ ...current, startingPoint }))}
                  />
                  <ChoiceGroup
                    title="Accommodation style"
                    options={accommodationOptions}
                    value={preferences.accommodationStyle}
                    onChange={(accommodationStyle) => setPreferences((current) => ({ ...current, accommodationStyle }))}
                  />
                </section>
              )}

              {step === 3 && (
                <section>
                  <h2 className="h3 fw-bold">Set the rhythm of your trip</h2>
                  <p className="text-secondary">Choose your dates, budget, and the pace that suits you.</p>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="planner-start-date">First day</label>
                      <input
                        id="planner-start-date"
                        className="form-control"
                        type="date"
                        min={today}
                        max={maximumEndDate}
                        required
                        value={preferences.startDate}
                        onChange={(event) => setPreferences((current) => ({
                          ...current,
                          startDate: event.target.value,
                          endDate: current.endDate < event.target.value ? event.target.value : current.endDate,
                        }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="planner-end-date">Last day</label>
                      <input
                        id="planner-end-date"
                        className="form-control"
                        type="date"
                        min={preferences.startDate}
                        max={maximumEndDate}
                        required
                        value={preferences.endDate}
                        onChange={(event) => setPreferences((current) => ({ ...current, endDate: event.target.value }))}
                      />
                    </div>
                  </div>
                  <ChoiceGroup
                    title="Your budget"
                    options={budgetOptions}
                    value={preferences.budgetTier}
                    onChange={(budgetTier) => setPreferences((current) => ({ ...current, budgetTier }))}
                  />
                  <ChoiceGroup
                    title="Your travel pace"
                    options={paceOptions}
                    value={preferences.pace}
                    onChange={(pace) => setPreferences((current) => ({ ...current, pace }))}
                  />
                </section>
              )}

              <div className="d-flex justify-content-between align-items-center gap-3 border-top mt-4 pt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => { setError(""); setStep((current) => Math.max(0, current - 1)); }}
                  disabled={step === 0 || generating}
                >
                  Back
                </button>
                <span className="small text-secondary">Step {step + 1} of 4 · Free</span>
                {step < 3 ? (
                  <button className="btn btn-dark px-4" type="submit">Continue</button>
                ) : (
                  <button className="btn btn-warning px-4" type="submit" disabled={generating}>
                    {generating ? "Crafting your itinerary…" : "Generate my free itinerary"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ChoiceGroup({ title, options, value, onChange }) {
  return (
    <fieldset className="mb-4">
      <legend className="form-label fw-semibold">{title}</legend>
      <div className="row g-2">
        {options.map((option) => (
          <div className="col-md-4 col-xl-3" key={option.value}>
            <button
              type="button"
              aria-pressed={value === option.value}
              className={`premium-tier ${value === option.value ? "selected" : ""}`}
              onClick={() => onChange(option.value)}
            >
              <span className="fw-semibold d-block">{option.label}</span>
              <span className="small text-secondary">{option.detail}</span>
            </button>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function ItineraryView({ itinerary, onEdit }) {
  return (
    <div className="vstack gap-4">
      <section className="premium-summary card">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
            <div>
              <p className="eyebrow mb-2">Made for your Jordan adventure</p>
              <h2 className="h2 fw-bold">{itinerary.title}</h2>
              <p className="text-secondary mb-0">{itinerary.summary}</p>
            </div>
            <div className="premium-budget">
              <span className="small text-secondary">Estimated trip costs</span>
              <strong>{itinerary.estimatedBudgetJod.toLocaleString()} JOD</strong>
              <span className="small text-secondary">per person · estimate</span>
            </div>
          </div>
          {itinerary.travelTips.length > 0 && (
            <div className="premium-tips mt-4">
              <h3 className="h6 fw-bold">Local notes for your trip</h3>
              <ul className="mb-0">{itinerary.travelTips.map((tip, index) => <li key={`${index}-${tip}`}>{tip}</li>)}</ul>
            </div>
          )}
        </div>
      </section>

      {itinerary.days.map((day) => (
        <section className="premium-day card" key={`${day.day}-${day.date}`}>
          <div className="card-body p-4">
            <div className="premium-day-heading">
              <span className="premium-day-number">Day {day.day}</span>
              <div>
                <h3 className="h4 fw-bold mb-1">{day.title}</h3>
                <p className="small text-secondary mb-0">
                  {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })} · {day.region}
                </p>
              </div>
            </div>
            <div className="premium-timeline mt-4">
              {day.activities.map((activity, index) => (
                <article className="premium-activity" key={`${activity.time}-${index}`}>
                  <div className="premium-activity-time">{activity.time}</div>
                  <div className="premium-activity-content">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                      <div>
                        <h4 className="h6 fw-bold mb-1">{activity.title}</h4>
                        <p className="small text-secondary mb-2">{activity.destination}</p>
                      </div>
                      <span className="badge text-bg-light border">{activity.estimatedCostJod} JOD est.</span>
                    </div>
                    <p className="mb-2">{activity.description}</p>
                    <p className="small text-secondary mb-1"><strong>Getting there:</strong> {activity.transport}</p>
                    <p className="small text-secondary mb-0"><strong>Before you go:</strong> {activity.bookingTip}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <p className="small text-secondary mb-0">Costs and schedules are estimates. Confirm entry, transport, weather, and trail conditions with official local sources.</p>
        <button type="button" className="btn btn-outline-secondary" onClick={onEdit}>Plan another itinerary</button>
      </div>
    </div>
  );
}
