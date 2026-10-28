import { Link } from "react-router-dom";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-JO", {
    style: "currency",
    currency: "JOD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function DestinationCard({
  destination,
  isFavorite,
  onToggleFavorite,
}) {
  return (
    <article className="card destination-card h-100">
      <div className="position-relative">
        <img
          className="card-img-top destination-photo"
          src={destination.image}
          alt={destination.name}
          loading="lazy"
        />
        <button
          type="button"
          className={`btn btn-sm favorite-button ${isFavorite ? "btn-danger" : "btn-light"}`}
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "♥ Saved" : "♡ Save"}
        </button>
      </div>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
          <span className="badge text-bg-warning">{destination.category}</span>
          <span className="small text-secondary">★ {destination.rating}</span>
        </div>
        <h2 className="h5 card-title fw-bold">{destination.name}</h2>
        <p className="small text-secondary">
          {destination.city}, {destination.region}
        </p>
        <p className="card-text">{destination.shortDescription}</p>
        <p className="small text-secondary">
          {destination.duration} · Estimate {formatCurrency(destination.price)}{" "}
          / person
        </p>
        <div className="mt-auto d-flex gap-2">
          <Link
            className="btn btn-dark flex-grow-1"
            to={`/destinations/${destination._id}`}
          >
            Details
          </Link>
          <Link
            className="btn btn-outline-secondary"
            to="/planner"
            state={{ destinationId: destination._id }}
          >
            Add to trip
          </Link>
        </div>
        {destination.imageCredit && (
          <a
            className="small text-secondary mt-2"
            href={destination.imageCredit}
            target="_blank"
            rel="noreferrer"
          >
            Photo source / license
          </a>
        )}
      </div>
    </article>
  );
}
