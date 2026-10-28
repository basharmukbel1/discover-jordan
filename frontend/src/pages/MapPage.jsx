import { useEffect, useState } from 'react';
import api from '../api';
import JordanMap from '../components/JordanMap';

export default function MapPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/api/destinations', { params: { limit: 100 } })
      .then(({ data }) => { if (active) setDestinations(data.destinations); })
      .catch(() => { if (active) setError('Could not load destinations for the map.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="vstack gap-3">
      <header>
        <p className="eyebrow mb-2">Jordan only</p>
        <h1 className="fw-bold">Map of destinations and activities</h1>
      </header>
      {loading ? <p className="text-secondary">Loading map…</p> : error ? <div className="alert alert-danger">{error}</div> : <JordanMap destinations={destinations} />}
    </div>
  );
}
