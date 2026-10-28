import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const JORDAN_CENTER = [31.24, 36.51];

function PriceMarker({ destination }) {
  const price = new Intl.NumberFormat('en-JO', { maximumFractionDigits: 0 }).format(Number(destination.price) || 0);
  const icon = useMemo(() => L.divIcon({
    className: 'price-marker-container',
    html: `<span class="price-marker"><span aria-hidden="true">📍</span> ${price} JOD</span>`,
    iconAnchor: [48, 16],
  }), [price]);

  return (
    <Marker position={[destination.location.lat, destination.location.lng]} icon={icon} title={destination.name}>
      <Popup>
        <div className="map-popup">
          <strong>{destination.name}</strong>
          <span>{destination.category} · {destination.city}</span>
          <span className="fw-bold">Estimate: {price} JOD / person</span>
          <Link to={`/destinations/${destination._id}`}>See details</Link>
        </div>
      </Popup>
    </Marker>
  );
}

function FitJordanPlaces({ destinations }) {
  const map = useMap();
  useEffect(() => {
    if (destinations.length) {
      const bounds = L.latLngBounds(destinations.map(({ location }) => [location.lat, location.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    } else {
      map.setView(JORDAN_CENTER, 7);
    }
  }, [destinations, map]);
  return null;
}

function CurrentLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 10);
  }, [map, position]);
  return position ? (
    <Marker position={[position.lat, position.lng]} title="Your current location">
      <Popup>Your current location. It is not sent to the server.</Popup>
    </Marker>
  ) : null;
}

export default function JordanMap({ destinations, className = '' }) {
  const [userPosition, setUserPosition] = useState(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [filter, setFilter] = useState('All');
  const mapDestinations = useMemo(
    () => destinations.filter(({ location }) => Number.isFinite(location?.lat) && Number.isFinite(location?.lng)),
    [destinations]
  );
  const visibleDestinations = mapDestinations.filter((place) => filter === 'All' || place.category === filter);
  const filters = ['All', 'Historical', 'Nature', 'Adventure', 'Hiking', 'Reserve', 'Museum', 'Cultural', 'Relaxation'];

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported by this browser.');
      return;
    }
    setLocationMessage('Waiting for browser location permission…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition({ lat: coords.latitude, lng: coords.longitude });
        setLocationMessage('Location is shown only in this browser and is not saved.');
      },
      (error) => {
        setLocationMessage(
          error.code === 1
            ? 'Location permission was denied. Allow it in your browser settings to try again.'
            : 'Could not get your location. Please try again.'
        );
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <section className={`card map-card ${className}`}>
      <div className="card-body">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
          <div>
            <h2 className="h4 fw-bold mb-1">Places and activity prices across Jordan</h2>
            <p className="small text-secondary mb-0">{visibleDestinations.length} map locations · estimated prices in JOD per person</p>
          </div>
          <button type="button" className="btn btn-outline-primary" onClick={requestLocation}>◎ Use my location</button>
        </div>
        {locationMessage && <p className="small text-secondary" role="status">{locationMessage}</p>}
        <div className="d-flex flex-wrap gap-2 mb-3" aria-label="Filter map by place type">
          {filters.map((item) => (
            <button type="button" key={item} className={`btn btn-sm ${filter === item ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <MapContainer center={JORDAN_CENTER} zoom={7} scrollWheelZoom className="jordan-map" aria-label="Map of Jordan locations with estimated prices">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitJordanPlaces destinations={visibleDestinations} />
          {visibleDestinations.map((destination) => <PriceMarker key={destination._id} destination={destination} />)}
          <CurrentLocation position={userPosition} />
        </MapContainer>
        <p className="small text-secondary mt-3 mb-0">
          Prices are indicative estimates, not live ticket quotes or bookings. Check each venue or operator for current rates, seasons, and access conditions.
        </p>
      </div>
    </section>
  );
}
