import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const initialForm = {
  name: '',
  city: '',
  region: '',
  category: 'Historical',
  shortDescription: '',
  description: '',
  image: '',
  price: 0,
  lat: '',
  lng: '',
};
const categories = ['Historical', 'Nature', 'Adventure', 'Cultural', 'Relaxation', 'Hiking', 'Reserve', 'Museum'];
const metrics = [
  { key: 'users', label: 'Registered travelers', icon: 'U', color: 'lime' },
  { key: 'destinations', label: 'Jordan destinations', icon: 'P', color: 'blue' },
  { key: 'trips', label: 'Trip plans', icon: 'T', color: 'purple' },
  { key: 'favorites', label: 'Places saved', icon: 'S', color: 'orange' },
];

const fetchOverview = async (token) => {
  const { data } = await api.get('/api/admin/overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.overview;
};

export default function AdminPage({ token }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      setOverview(await fetchOverview(token));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load admin analytics.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    fetchOverview(token)
      .then((data) => {
        if (active) {
          setOverview(data);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load admin analytics.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token]);

  const createDestination = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.post('/api/destinations', {
        ...form,
        price: Number(form.price),
        location: { lat: Number(form.lat), lng: Number(form.lng) },
      }, { headers: { Authorization: `Bearer ${token}` } });
      setForm(initialForm);
      setSuccess('Destination added to the Jordan catalog.');
      await loadOverview();
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Could not add this destination.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/">
          <span className="admin-brand-mark">J</span>
          <span>Discover Jordan<small>ADMIN CONSOLE</small></span>
        </Link>
        <p className="admin-nav-label">WORKSPACE</p>
        <nav className="admin-nav" aria-label="Admin navigation">
          <a className="active" href="#overview"><span>◫</span> Overview</a>
          <a href="#analytics"><span>⌁</span> Analytics</a>
          <a href="#places"><span>◇</span> Destinations</a>
          <Link to="/"><span>↗</span> View website</Link>
        </nav>
        <div className="admin-sidebar-note">
          <span className="admin-status-dot" />
          <div><strong>Jordan catalog</strong><small>Live platform overview</small></div>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">DISCOVER JORDAN / ADMIN</p>
            <h1>Overview</h1>
          </div>
          <Link className="admin-view-site" to="/">View website <span aria-hidden="true">↗</span></Link>
        </header>

        {error && <div className="alert alert-danger" role="alert">{error} <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={loadOverview}>Retry</button></div>}
        {loading ? <div className="admin-loading" role="status">Loading dashboard metrics…</div> : overview && (
          <>
            <section id="overview" className="admin-metrics" aria-label="Platform totals">
              {metrics.map(({ key, label, icon, color }) => (
                <article className="admin-metric-card" key={key}>
                  <div className={`admin-metric-icon ${color}`} aria-hidden="true">{icon}</div>
                  <div className="admin-metric-label">{label}</div>
                  <div className="admin-metric-value">{overview.totals[key].toLocaleString()}</div>
                  <div className="admin-metric-note">Current platform total</div>
                </article>
              ))}
            </section>

            <section id="analytics" className="admin-analytics-grid">
              <article className="admin-panel admin-trend-panel">
                <div className="admin-panel-heading">
                  <div><p className="admin-kicker">PLATFORM ACTIVITY</p><h2>Growth overview</h2></div>
                  <span className="admin-period">Last 6 months</span>
                </div>
                <MonthlyTrendChart data={overview.monthlyTrend} />
              </article>
              <article className="admin-panel">
                <div className="admin-panel-heading">
                  <div><p className="admin-kicker">DESTINATION MIX</p><h2>Places by category</h2></div>
                </div>
                <CategoryBreakdown categories={overview.categories} total={overview.totals.destinations} />
              </article>
            </section>

            <section className="admin-panel admin-recent-panel">
              <div className="admin-panel-heading">
                <div><p className="admin-kicker">COMMUNITY</p><h2>Recently joined travelers</h2></div>
                <span className="admin-period">Latest 5 accounts</span>
              </div>
              {overview.recentUsers.length ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead><tr><th>Traveler</th><th>Account type</th><th>Joined</th></tr></thead>
                    <tbody>{overview.recentUsers.map((user) => (
                      <tr key={user._id}>
                        <td><span className="admin-avatar">{user.name?.trim()?.[0]?.toUpperCase() || 'T'}</span>{user.name}</td>
                        <td><span className="admin-role">{user.role}</span></td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="admin-empty">New accounts will appear here.</p>}
            </section>

            <section id="places" className="admin-panel admin-create-panel">
              <div className="admin-panel-heading">
                <div><p className="admin-kicker">CATALOG MANAGEMENT</p><h2>Add a destination</h2></div>
                <span className="admin-period">Map coordinates required</span>
              </div>
              {formError && <div className="alert alert-danger" role="alert">{formError}</div>}
              {success && <div className="alert alert-success" role="status">{success}</div>}
              <form className="row g-3" onSubmit={createDestination}>
                {[
                  ['name', 'Place name', 'text'],
                  ['city', 'City', 'text'],
                  ['region', 'Region', 'text'],
                  ['shortDescription', 'Short description', 'text'],
                  ['image', 'Photo URL', 'url'],
                  ['lat', 'Latitude', 'number'],
                  ['lng', 'Longitude', 'number'],
                  ['price', 'Estimated price (JOD)', 'number'],
                ].map(([field, label, type]) => (
                  <div className="col-md-6" key={field}>
                    <label className="admin-form-label" htmlFor={`destination-${field}`}>{label}</label>
                    <input
                      id={`destination-${field}`}
                      className="form-control admin-form-control"
                      type={type}
                      required
                      min={type === 'number' && field === 'price' ? 0 : undefined}
                      step={type === 'number' && field !== 'price' ? 'any' : undefined}
                      value={form[field]}
                      onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                    />
                  </div>
                ))}
                <div className="col-md-6">
                  <label className="admin-form-label" htmlFor="destination-category">Category</label>
                  <select id="destination-category" className="form-select admin-form-control" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="admin-form-label" htmlFor="destination-description">Description</label>
                  <textarea id="destination-description" className="form-control admin-form-control" rows="4" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                </div>
                <div className="col-12">
                  <button className="btn admin-primary-button" disabled={saving}>{saving ? 'Adding…' : 'Add destination'}</button>
                  <span className="admin-form-hint ms-3">Provide coordinates to place it on the map.</span>
                </div>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function MonthlyTrendChart({ data }) {
  const chartWidth = 640;
  const chartHeight = 250;
  const top = 24;
  const base = 205;
  const max = Math.max(1, ...data.map(({ users, trips }) => Math.max(users, trips)));
  const groupWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(20, groupWidth * 0.22);

  return (
    <div className="admin-chart-wrap">
      <div className="admin-chart-legend"><span><i className="legend-users" /> New travelers</span><span><i className="legend-trips" /> Trip plans</span></div>
      <svg className="admin-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Monthly counts of new travelers and saved trip plans for the last six months">
        {[0, 1, 2, 3].map((line) => {
          const y = top + ((base - top) / 3) * line;
          return <line key={line} x1="30" y1={y} x2={chartWidth - 10} y2={y} className="admin-chart-grid" />;
        })}
        {data.map(({ label, users, trips }, index) => {
          const center = groupWidth * index + groupWidth / 2;
          const userHeight = (users / max) * (base - top);
          const tripHeight = (trips / max) * (base - top);
          return (
            <g key={label}>
              <rect x={center - barWidth - 2} y={base - userHeight} width={barWidth} height={userHeight} rx="5" className="admin-chart-user-bar">
                <title>{label}: {users} new travelers</title>
              </rect>
              <rect x={center + 2} y={base - tripHeight} width={barWidth} height={tripHeight} rx="5" className="admin-chart-trip-bar">
                <title>{label}: {trips} trip plans</title>
              </rect>
              <text x={center} y="235" textAnchor="middle" className="admin-chart-label">{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CategoryBreakdown({ categories, total }) {
  if (!categories.length) return <p className="admin-empty">Add destinations to see the category mix.</p>;
  return (
    <div className="admin-category-list">
      {categories.map(({ name, count }, index) => (
        <div className="admin-category-row" key={name}>
          <div className="admin-category-meta"><span>{name}</span><strong>{count}</strong></div>
          <div className="admin-category-track"><span style={{ width: `${(count / Math.max(total, 1)) * 100}%` }} className={`category-fill category-fill-${index % 4}`} /></div>
        </div>
      ))}
    </div>
  );
}
