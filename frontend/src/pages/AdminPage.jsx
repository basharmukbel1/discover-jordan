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
  { key: 'trips', label: 'Saved trip plans', icon: 'route', color: 'blue', note: 'Created by travelers' },
  { key: 'favorites', label: 'Places saved', icon: 'heart', color: 'pink', note: 'Total community saves' },
  { key: 'users', label: 'Travelers', icon: 'users', color: 'green', note: 'Registered accounts' },
  { key: 'destinations', label: 'Jordan destinations', icon: 'pin', color: 'yellow', note: 'Published catalog places' },
];

const fetchOverview = async (token) => {
  const { data } = await api.get('/api/admin/overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.overview;
};

export default function AdminPage({ token, user }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
  const visibleUsers = (overview?.recentUsers || []).filter((recentUser) =>
    `${recentUser.name || ''} ${recentUser.role || ''}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/">
          <span className="admin-brand-mark">J</span>
          <span>Discover Jordan<small>ADMIN WORKSPACE</small></span>
        </Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          <p className="admin-nav-label">WORKSPACE</p>
          <a className="active" href="#overview"><span aria-hidden="true">▦</span> Overview</a>
          <a href="#analytics"><span aria-hidden="true">⌁</span> Analytics</a>
          <a href="#community"><span aria-hidden="true">♙</span> Travelers</a>
          <p className="admin-nav-label admin-nav-spaced">MANAGEMENT</p>
          <a href="#places"><span aria-hidden="true">◇</span> Destinations</a>
          <Link to="/"><span aria-hidden="true">↗</span> View website</Link>
        </nav>
        <div className="admin-sidebar-note">
          <span className="admin-status-dot" />
          <div><strong>Platform status</strong><small>Dashboard data is live</small></div>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <label className="admin-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search recent travelers"
              aria-label="Search recent travelers"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <div className="admin-topbar-actions">
            <span className="admin-live-indicator"><i /> Live</span>
            <span className="admin-topbar-divider" />
            <span className="admin-profile-avatar" aria-hidden="true">
              {(user?.name || user?.email || 'A').trim().charAt(0).toUpperCase()}
            </span>
            <span className="admin-profile-name">
              <strong>{user?.name || 'Administrator'}</strong>
              <small>Site admin</small>
            </span>
            <Link className="admin-view-site" to="/">Visit site <span aria-hidden="true">↗</span></Link>
          </div>
        </header>

        <div className="admin-workspace">
          <header className="admin-page-heading">
            <div>
              <p className="admin-kicker">DISCOVER JORDAN / OVERVIEW</p>
              <h1>Good to see you, {user?.name?.split(/\s+/)[0] || 'Admin'}</h1>
              <p>Here’s what’s happening across your travel community.</p>
            </div>
            <span className="admin-period"><i aria-hidden="true">◷</i> Last 6 months</span>
          </header>

          {error && <div className="alert alert-danger" role="alert">{error} <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={loadOverview}>Retry</button></div>}
          {loading ? <div className="admin-loading" role="status">Loading dashboard metrics…</div> : overview && (
            <>
            <section id="overview" className="admin-metrics" aria-label="Platform totals">
              {metrics.map(({ key, label, icon, color, note }) => (
                <article className="admin-metric-card" key={key}>
                  <div className="admin-metric-topline">
                    <span className="admin-metric-label">{label}</span>
                    <span className={`admin-metric-icon ${color}`} aria-hidden="true"><MetricIcon name={icon} /></span>
                  </div>
                  <div className="admin-metric-value">{(overview.totals[key] || 0).toLocaleString()}</div>
                  <div className="admin-metric-note"><span className="admin-metric-dot" />{note}</div>
                </article>
              ))}
            </section>

            <section id="analytics" className="admin-analytics-grid admin-chart-row">
              <article className="admin-panel admin-trend-panel">
                <div className="admin-panel-heading">
                  <div><p className="admin-kicker">COMMUNITY GROWTH</p><h2>Platform activity</h2></div>
                  <span className="admin-chart-caption">Monthly totals</span>
                </div>
                <MonthlyTrendChart data={overview.monthlyTrend} />
              </article>
              <article className="admin-panel admin-orders-panel">
                <div className="admin-panel-heading">
                  <div><p className="admin-kicker">TRAVEL PLANNING</p><h2>Trip plans</h2></div>
                </div>
                <MonthlyTripChart data={overview.monthlyTrend} />
              </article>
            </section>

            <section className="admin-insights-row">
              <article className="admin-panel admin-category-panel">
                <div className="admin-panel-heading">
                  <div><p className="admin-kicker">DESTINATION MIX</p><h2>Places by category</h2></div>
                  <span className="admin-panel-menu" aria-hidden="true">···</span>
                </div>
                <CategoryBreakdown categories={overview.categories} total={overview.totals.destinations} />
              </article>
              <section className="admin-metric-grid" aria-label="Platform summary metrics">
                {metrics.map(({ key, label, icon, color, note }) => (
                  <article className="admin-summary-card" key={key}>
                    <div className="admin-summary-heading">
                      <div><span>{label}</span><strong>{(overview.totals[key] || 0).toLocaleString()}</strong></div>
                      <span className={`admin-metric-icon ${color}`} aria-hidden="true"><MetricIcon name={icon} /></span>
                    </div>
                    <div className="admin-summary-footer"><span>{note}</span><i className={`summary-accent ${color}`} /></div>
                  </article>
                ))}
              </section>
            </section>

            <section id="community" className="admin-panel admin-recent-panel">
              <div className="admin-panel-heading">
                <div><p className="admin-kicker">COMMUNITY</p><h2>Recently joined travelers</h2></div>
                <span className="admin-period">Latest {overview.recentUsers.length} accounts</span>
              </div>
              {visibleUsers.length ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead><tr><th>Traveler</th><th>Account type</th><th>Joined</th></tr></thead>
                    <tbody>{visibleUsers.map((recentUser) => (
                      <tr key={recentUser._id}>
                        <td><span className="admin-avatar">{recentUser.name?.trim()?.[0]?.toUpperCase() || 'T'}</span>{recentUser.name}</td>
                        <td><span className="admin-role">{recentUser.role}</span></td>
                        <td>{new Date(recentUser.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="admin-empty">{searchTerm ? 'No recent travelers match your search.' : 'New accounts will appear here.'}</p>}
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
    </div>
  );
}

function MetricIcon({ name }) {
  const paths = {
    route: <><path d="M5 5.5h8.5a3 3 0 0 1 0 6H8.5a3 3 0 0 0 0 6H19" /><path d="m16 14 3 3-3 3" /><circle cx="5" cy="5.5" r="2" /></>,
    heart: <path d="M20.8 8.8c0 5.4-8.8 10-8.8 10s-8.8-4.6-8.8-10a4.5 4.5 0 0 1 8.8-1.4 4.5 4.5 0 0 1 8.8 1.4Z" />,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" /><circle cx="9.5" cy="7" r="4" /><path d="M17 11a4 4 0 0 0 0-8m4 17v-1.5a4 4 0 0 0-3-3.9" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function MonthlyTrendChart({ data }) {
  const chartWidth = 700;
  const chartHeight = 250;
  const left = 38;
  const right = 690;
  const top = 25;
  const base = 205;
  const max = Math.max(1, ...data.map(({ users, trips }) => Math.max(users, trips)));
  const getPoints = (key) => data.map((item, index) => ({
    x: left + (data.length <= 1 ? 0 : (right - left) * index / (data.length - 1)),
    y: base - (item[key] / max) * (base - top),
  }));
  const linePath = (points) => points.map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const usersPath = linePath(getPoints('users'));
  const tripsPath = linePath(getPoints('trips'));
  const usersArea = `${usersPath} L ${right} ${base} L ${left} ${base} Z`;
  const tripsArea = `${tripsPath} L ${right} ${base} L ${left} ${base} Z`;

  return (
    <div className="admin-chart-wrap">
      <div className="admin-chart-legend"><span><i className="legend-users" /> New travelers</span><span><i className="legend-trips" /> Saved trip plans</span></div>
      <svg className="admin-chart admin-line-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Monthly counts of new travelers and saved trip plans for the last six months">
        <defs>
          <linearGradient id="admin-users-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0789ff" stopOpacity=".4" /><stop offset="1" stopColor="#0789ff" stopOpacity=".02" /></linearGradient>
          <linearGradient id="admin-trips-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fa7b35" stopOpacity=".25" /><stop offset="1" stopColor="#fa7b35" stopOpacity=".015" /></linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = top + ((base - top) / 3) * line;
          return <g key={line}><line x1={left} y1={y} x2={right} y2={y} className="admin-chart-grid" /><text x="0" y={y + 4} className="admin-chart-axis">{Math.round(max * (1 - line / 3))}</text></g>;
        })}
        <path d={usersArea} fill="url(#admin-users-fill)" />
        <path d={tripsArea} fill="url(#admin-trips-fill)" />
        <path d={usersPath} className="admin-chart-user-line" />
        <path d={tripsPath} className="admin-chart-trip-line" />
        {data.map(({ label }, index) => {
          const x = left + (data.length <= 1 ? 0 : (right - left) * index / (data.length - 1));
          const usersPoint = getPoints('users')[index];
          const tripsPoint = getPoints('trips')[index];
          return <g key={label}>
            <circle cx={usersPoint.x} cy={usersPoint.y} r="3.5" className="admin-chart-user-point"><title>{label}: {data[index].users} new travelers</title></circle>
            <circle cx={tripsPoint.x} cy={tripsPoint.y} r="3.5" className="admin-chart-trip-point"><title>{label}: {data[index].trips} trip plans</title></circle>
            <text x={x} y="235" textAnchor="middle" className="admin-chart-label">{label}</text>
          </g>;
        })}
      </svg>
    </div>
  );
}

function MonthlyTripChart({ data }) {
  const max = Math.max(1, ...data.map(({ trips }) => trips));
  return (
    <div className="admin-trip-chart" role="img" aria-label="Monthly saved trip plans for the last six months">
      {data.map(({ label, trips }) => (
        <div className="admin-trip-column" key={label}>
          <span className="admin-trip-count">{trips}</span>
          <span className="admin-trip-bar-track"><i style={{ height: `${Math.max(4, (trips / max) * 100)}%` }} /></span>
          <span className="admin-trip-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function CategoryBreakdown({ categories, total }) {
  if (!categories.length) return <p className="admin-empty">Add destinations to see the category mix.</p>;
  const palette = ['#0a8cff', '#ff3b62', '#19ce5a', '#f7a928', '#a979ff', '#11b8d5', '#ff7448', '#d2e342'];
  const segments = categories.map(({ count }, index) => {
    const start = categories.slice(0, index).reduce(
      (sum, category) => sum + (category.count / Math.max(total, 1)) * 100,
      0
    );
    const end = start + (count / Math.max(total, 1)) * 100;
    return `${palette[index % palette.length]} ${start}% ${end}%`;
  });
  return (
    <div className="admin-category-content">
      <div className="admin-donut" style={{ background: `conic-gradient(${segments.join(', ')})` }} role="img" aria-label={`${total} destinations across ${categories.length} categories`}>
        <div><strong>{total.toLocaleString()}</strong><span>places</span></div>
      </div>
      <div className="admin-category-list">
        {categories.slice(0, 6).map(({ name, count }, index) => (
          <div className="admin-category-row" key={name}>
            <span className="admin-category-name"><i style={{ background: palette[index % palette.length] }} />{name}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
