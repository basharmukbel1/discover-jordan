import { createContext, lazy, Suspense, useContext, useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import api from './api';
import AiTripAssistant from './components/AiTripAssistant';
import DestinationCard from './components/DestinationCard';
import GoogleSignInButton from './components/GoogleSignInButton';

const MapPage = lazy(() => import('./pages/MapPage'));
const JordanMap = lazy(() => import('./components/JordanMap'));
const AdminDashboardPage = lazy(() => import('./pages/AdminPage'));
const VerifyEmailPage = lazy(() =>
  import('./pages/AccountEmailPages').then((module) => ({ default: module.VerifyEmailPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/AccountEmailPages').then((module) => ({ default: module.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import('./pages/AccountEmailPages').then((module) => ({ default: module.ResetPasswordPage }))
);
const categories = ['All', 'Historical', 'Nature', 'Adventure', 'Cultural', 'Relaxation', 'Hiking', 'Reserve', 'Museum'];
const AuthContext = createContext(null);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('discover-jordan-user') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('discover-jordan-token') || '');
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('discover-jordan-token')));
  const [theme, setTheme] = useState(() => localStorage.getItem('discover-jordan-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('discover-jordan-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let active = true;
    api.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setToken('');
        localStorage.removeItem('discover-jordan-user');
        localStorage.removeItem('discover-jordan-token');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('discover-jordan-user', JSON.stringify(user));
    else localStorage.removeItem('discover-jordan-user');
  }, [user]);

  const authenticate = async (path, credentials) => {
    const { data } = await api.post(path, credentials);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('discover-jordan-token', data.token);
    return data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('discover-jordan-token');
  };

  const value = {
    user,
    token,
    loading,
    theme,
    setTheme,
    setUser,
    login: (credentials) => authenticate('/api/auth/login', credentials),
    register: async (credentials) => {
      const { data } = await api.post('/api/auth/register', credentials);
      return data;
    },
    googleLogin: (credential) => authenticate('/api/auth/google', { credential }),
    logout,
    favoriteIds: useMemo(
      () => user?.favorites?.map((item) => (typeof item === 'string' ? item : item?._id || item)) ?? [],
      [user]
    ),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function AppLayout() {
  const { token, user, logout, theme, setTheme } = useAuth();
  const location = useLocation();
  const links = [
    { to: '/', label: 'Map' },
    { to: '/destinations', label: 'Places' },
    { to: '/planner', label: 'Plan a trip' },
    { to: '/favorites', label: 'Saved' },
  ];

  return (
    <div className="app-shell min-vh-100">
      <nav className="navbar navbar-expand-lg border-bottom bg-body sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
            <span className="brand-mark">J</span>
            <span>Discover Jordan<small className="d-block fw-normal text-secondary">Explore the wonder</small></span>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="mainNavbar">
            <div className="navbar-nav mx-auto">
              {links.map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`}>
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '☾ Dark' : '☀ Light'}
              </button>
              {token && user ? (
                <>
                  {user.role === 'admin' && <Link className="btn btn-outline-primary" to="/admin">Admin</Link>}
                  <Link className="btn btn-outline-secondary" to="/profile">{user.name}</Link>
                  <button type="button" className="btn btn-dark" onClick={logout}>Sign out</button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-secondary" to="/login">Sign in</Link>
                  <Link className="btn btn-warning" to="/register">Join now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className={location.pathname === '/admin' ? 'admin-main' : 'container py-4 py-lg-5'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<Suspense fallback={<Loading />}><MapPage /></Suspense>} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:id" element={<DestinationDetailPage />} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Suspense fallback={<Loading />}><AdminDashboardPage token={token} user={user} /></Suspense></ProtectedRoute>} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/verify-email" element={<Suspense fallback={<Loading />}><VerifyEmailPage /></Suspense>} />
          <Route path="/forgot-password" element={<Suspense fallback={<Loading />}><ForgotPasswordPage /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<Loading />}><ResetPasswordPage /></Suspense>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-top py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2 small text-secondary">
          <span>© 2026 Discover Jordan · Prices are estimates; verify with official providers.</span>
          <span>Map data © OpenStreetMap contributors</span>
        </div>
      </footer>
    </div>
  );
}

function Loading() {
  return <div className="py-5 text-center text-secondary" role="status">Loading…</div>;
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <AdminAccessPage user={user} />;
  return children;
}

function AdminAccessPage({ user }) {
  return (
    <section className="card mx-auto my-5" style={{ maxWidth: '38rem' }}>
      <div className="card-body p-4">
        <p className="eyebrow mb-2">Admin workspace</p>
        <h1 className="h3 fw-bold">Admin access required</h1>
        <p className="text-secondary">
          Signed in as <strong>{user.email}</strong>. This account does not have
          the administrator role yet. Ask the site owner to assign this exact
          email in the backend <code>ADMIN_EMAIL</code> setting, then sign in
          again.
        </p>
        <Link className="btn btn-dark" to="/">Return to Discover Jordan</Link>
      </div>
    </section>
  );
}

function useDestinations(params = {}) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const query = JSON.stringify(params);
  useEffect(() => {
    let active = true;
    api.get('/api/destinations', { params: JSON.parse(query) })
      .then(({ data }) => {
        if (active) setDestinations(data.destinations);
      })
      .catch(() => {
        if (active) setError('Could not load destinations. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);
  return { destinations, setDestinations, loading, error };
}

function HomePage() {
  const { destinations, loading, error } = useDestinations({ limit: 100 });
  return (
    <div className="vstack gap-4">
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
        <div>
          <p className="eyebrow mb-2">Discover Jordan</p>
          <h1 className="display-6 fw-bold mb-2">Find your next adventure</h1>
          <p className="text-secondary mb-0">Explore heritage sites, hikes, reserves, museums, and activities across Jordan.</p>
        </div>
        <Link to="/destinations" className="btn btn-dark">Browse all places</Link>
      </header>
      {loading ? <Loading /> : error ? <div className="alert alert-danger">{error}</div> : (
        <Suspense fallback={<Loading />}><JordanMap destinations={destinations} className="map-home" /></Suspense>
      )}
      <section className="d-flex flex-wrap gap-2" aria-label="Map legend">
        {['Heritage', 'Hiking & nature', 'Museums', 'Activities'].map((label) => (
          <span key={label} className="badge text-bg-light border">{label}</span>
        ))}
        <span className="small text-secondary align-self-center">Marker prices are estimated per-person entry or activity costs in JOD.</span>
      </section>
    </div>
  );
}

function DestinationsPage() {
  const { token, user, setUser, favoriteIds } = useAuth();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      api.get('/api/destinations', {
        params: { search, category, page, limit: 12 },
      }).then(({ data }) => {
        setDestinations(data.destinations);
        setTotalPages(data.totalPages || 1);
      }).catch(() => {
        setError('Could not load destinations. Please try again.');
      }).finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [search, category, page]);

  const toggleFavorite = async (id) => {
    if (!token || !user) return navigate('/login');
    try {
      const { data } = await api.post(`/api/destinations/favorite/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, favorites: data.favorites });
    } catch {
      setError('Could not update your saved places.');
    }
  };

  return (
    <div className="vstack gap-4">
      <div>
        <p className="eyebrow mb-2">Places and experiences</p>
        <h1 className="fw-bold">Explore the Jordan catalog</h1>
      </div>
      <form className="row g-2" onSubmit={(event) => { event.preventDefault(); setSearch(query.trim()); setPage(1); }}>
        <div className="col-md">
          <label className="visually-hidden" htmlFor="place-search">Search destinations</label>
          <input id="place-search" className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by place, city, or region" />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-dark w-100" type="submit">Search</button>
        </div>
      </form>
      <div className="d-flex flex-wrap gap-2">
        {categories.map((item) => (
          <button key={item} type="button" className={`btn btn-sm ${category === item ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => { setCategory(item); setPage(1); }}>
            {item}
          </button>
        ))}
      </div>
      {loading ? <Loading /> : error ? <div className="alert alert-danger">{error}</div> : (
        <>
          <div className="row g-4">
            {destinations.map((destination) => (
              <div className="col-sm-6 col-lg-4 col-xl-3" key={destination._id}>
                <DestinationCard destination={destination} isFavorite={favoriteIds.includes(destination._id)} onToggleFavorite={() => toggleFavorite(destination._id)} />
              </div>
            ))}
          </div>
          {!destinations.length && <div className="alert alert-light border">No matching destinations found.</div>}
          <div className="d-flex justify-content-center align-items-center gap-3">
            <button type="button" className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
            <span className="small text-secondary">Page {page} of {totalPages}</span>
            <button type="button" className="btn btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

function DestinationDetailPage() {
  const { id } = useParams();
  const { token, user, favoriteIds, setUser } = useAuth();
  const [destination, setDestination] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    api.get(`/api/destinations/${id}`)
      .then(({ data }) => setDestination(data.destination))
      .catch(() => setError('Destination not found.'));
  }, [id]);

  const toggleFavorite = async () => {
    if (!token || !user) return navigate('/login');
    try {
      const { data } = await api.post(`/api/destinations/favorite/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, favorites: data.favorites });
    } catch {
      setError('Could not update your saved places.');
    }
  };

  if (!destination) return error ? <div className="alert alert-warning">{error}</div> : <Loading />;
  return (
    <div className="vstack gap-4">
      <img className="detail-photo rounded-4" src={destination.image} alt={destination.name} />
      {destination.imageCredit && <a className="small text-secondary" href={destination.imageCredit} target="_blank" rel="noreferrer">Photo source and license</a>}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div><p className="eyebrow mb-2">{destination.category}</p><h1 className="fw-bold mb-1">{destination.name}</h1><p className="text-secondary mb-0">{destination.city}, {destination.region}</p></div>
        <div className="d-flex gap-2">
          <button type="button" className={`btn ${favoriteIds.includes(id) ? 'btn-danger' : 'btn-outline-secondary'}`} onClick={toggleFavorite}>{favoriteIds.includes(id) ? 'Saved' : 'Save place'}</button>
          <button type="button" className="btn btn-warning" onClick={() => navigate('/planner', { state: { destinationId: id } })}>Add to trip</button>
        </div>
      </div>
      {error && <div className="alert alert-warning">{error}</div>}
      <p className="lead">{destination.description}</p>
      <div className="row g-3">
        <InfoTile label="Estimated entry/activity price" value={formatCurrency(destination.price)} />
        <InfoTile label="Suggested duration" value={destination.duration} />
        <InfoTile label="Best for" value={destination.bestFor?.join(', ') || 'All travelers'} />
        <InfoTile label="Highlights" value={destination.highlights?.join(', ') || 'Explore the area'} />
      </div>
      <p className="small text-secondary">Prices are estimates in JOD per person, not bookings. Check current costs with the official venue or operator.</p>
    </div>
  );
}

function InfoTile({ label, value }) {
  return <div className="col-sm-6 col-lg-3"><div className="card h-100"><div className="card-body"><div className="small text-secondary">{label}</div><div className="fw-semibold mt-2">{value}</div></div></div></div>;
}

function PlannerPage() {
  const { token } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [destinationCategory, setDestinationCategory] = useState('All');
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({ title: '', startDate: '', endDate: '', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/api/destinations', { params: { limit: 100 } }),
      api.get('/api/trips', { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([destinationResponse, tripResponse]) => {
      if (!active) return;
      setDestinations(destinationResponse.data.destinations);
      setTrips(tripResponse.data.trips);
    }).catch(() => {
      if (active) setError('Could not load your planner. Refresh to try again.');
    });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    const id = location.state?.destinationId;
    if (id) setSelectedIds((ids) => ids.includes(id) ? ids : [...ids, id]);
  }, [location.state]);

  const chosen = destinations.filter(({ _id }) => selectedIds.includes(_id));
  const visibleDestinations = useMemo(() => {
    const searchTerm = destinationSearch.trim().toLowerCase();
    return destinations
      .filter((destination) => {
        const matchesSearch = !searchTerm || [
          destination.name,
          destination.city,
          destination.region,
        ].some((value) => value?.toLowerCase().includes(searchTerm));
        const matchesCategory = destinationCategory === 'All' ||
          destination.category === destinationCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [destinations, destinationSearch, destinationCategory]);
  const toggleDestination = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const saveTrip = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/api/trips', { ...form, destinations: selectedIds }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips((items) => [data.trip, ...items]);
      setForm({ title: '', startDate: '', endDate: '', notes: '' });
      setSelectedIds([]);
      setSuccess('Your trip was saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your trip.');
    }
  };

  const tripContext = {
    startDate: form.startDate,
    endDate: form.endDate,
    notes: form.notes,
    destinationIds: chosen.map(({ _id }) => _id),
  };
  const estimatedTotal = chosen.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <section className="card">
          <div className="card-body p-4">
            <p className="eyebrow mb-2">Trip builder</p>
            <h1 className="h2 fw-bold">Create your Jordan itinerary</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form className="vstack gap-3 mt-4" onSubmit={saveTrip}>
              <input className="form-control" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Trip name" />
              <div className="row g-3">
                <div className="col"><label className="form-label">Start</label><input className="form-control" type="date" required value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></div>
                <div className="col"><label className="form-label">End</label><input className="form-control" type="date" required min={form.startDate || undefined} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></div>
              </div>
              <textarea className="form-control" rows="3" placeholder="Interests, pace, or other notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              <fieldset>
                <legend className="form-label">Choose places and activities ({selectedIds.length} selected)</legend>
                <div className="row g-2 mb-3">
                  <div className="col-md">
                    <label className="visually-hidden" htmlFor="planner-place-search">Search places</label>
                    <input
                      id="planner-place-search"
                      className="form-control"
                      value={destinationSearch}
                      onChange={(event) => setDestinationSearch(event.target.value)}
                      placeholder="Filter by place, city, or region"
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="visually-hidden" htmlFor="planner-place-category">Filter places by category</label>
                    <select
                      id="planner-place-category"
                      className="form-select"
                      value={destinationCategory}
                      onChange={(event) => setDestinationCategory(event.target.value)}
                    >
                      {categories.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </div>
                </div>
                {selectedIds.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-secondary">Estimated selection total: {formatCurrency(estimatedTotal)}</span>
                    <button className="btn btn-sm btn-link" type="button" onClick={() => setSelectedIds([])}>Clear selection</button>
                  </div>
                )}
                <div className="row g-2">
                  {visibleDestinations.map((destination) => (
                    <div className="col-sm-6" key={destination._id}>
                      <button
                        type="button"
                        aria-pressed={selectedIds.includes(destination._id)}
                        onClick={() => toggleDestination(destination._id)}
                        className={`btn w-100 text-start ${selectedIds.includes(destination._id) ? 'btn-warning' : 'btn-outline-secondary'}`}
                      >
                        <span className="fw-semibold d-block">{destination.name}</span>
                        <span className="small">{formatCurrency(destination.price)} · {destination.category}</span>
                      </button>
                    </div>
                  ))}
                </div>
                {!visibleDestinations.length && <p className="small text-secondary mt-2 mb-0">No places match these filters. Try another search or category.</p>}
              </fieldset>
              <div className="d-flex justify-content-between"><span>Estimated entry/activity subtotal</span><strong>{formatCurrency(estimatedTotal)}</strong></div>
              <p className="small text-secondary">Estimate only; accommodation, transport, meals, taxes and actual provider prices may differ.</p>
              <button className="btn btn-dark" type="submit" disabled={!selectedIds.length}>Save trip plan</button>
            </form>
            <div className="border-top mt-4 pt-4">
              <AiTripAssistant token={token} tripContext={tripContext} />
            </div>
          </div>
        </section>
      </div>
      <div className="col-lg-5">
        <div className="card">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold">Saved trip plans</h2>
            {!trips.length ? <p className="text-secondary mb-0">Your saved plans will appear here.</p> : (
              <div className="vstack gap-3 mt-3">
                {trips.map((trip) => (
                  <article className="card" key={trip._id}>
                    <div className="card-body">
                      <h3 className="h5">{trip.title}</h3>
                      <p className="small text-secondary">{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</p>
                      <div className="d-flex flex-wrap gap-2">{(trip.destinations || []).map((item) => <span className="badge text-bg-light border" key={item._id || item}>{typeof item === 'string' ? item : item.name}</span>)}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <div className="alert alert-light border mt-4 mb-0">
              <strong>Stripe checkout:</strong> not connected. This planner does not charge or take payments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FavoritesPage() {
  const { user, favoriteIds, token, setUser } = useAuth();
  const { destinations, loading, error } = useDestinations({ limit: 100 });
  const saved = destinations.filter(({ _id }) => favoriteIds.includes(_id));
  const removeFavorite = async (id) => {
    try {
      const { data } = await api.post(`/api/destinations/favorite/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUser({ ...user, favorites: data.favorites });
    } catch {
      // The next page load will refresh the saved list from the API.
    }
  };
  if (loading) return <Loading />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  return <div className="vstack gap-4"><h1 className="fw-bold">Saved places</h1>{saved.length ? <div className="row g-4">{saved.map((item) => <div className="col-md-6 col-xl-4" key={item._id}><DestinationCard destination={item} isFavorite onToggleFavorite={() => removeFavorite(item._id)} /></div>)}</div> : <div className="alert alert-light border">You have not saved places yet.</div>}</div>;
}

function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const save = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.put('/api/users/profile', { name }, { headers: { Authorization: `Bearer ${token}` } });
      setUser(data.user);
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update profile.');
    }
  };
  return <section className="card mx-auto profile-card"><div className="card-body p-4"><h1 className="h2 fw-bold">Your profile</h1><p className="text-secondary">{user.email}</p><form className="vstack gap-3" onSubmit={save}><label className="form-label">Name<input className="form-control mt-1" value={name} onChange={(event) => setName(event.target.value)} required /></label><button className="btn btn-dark">Save changes</button></form>{message && <p className="mt-3 mb-0" role="status">{message}</p>}</div></section>;
}

export function LegacyAdminPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({ name: '', city: '', region: '', category: 'Historical', shortDescription: '', description: '', image: '', price: 0 });
  const [message, setMessage] = useState('');
  const create = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/destinations', form, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Place created.');
      setForm({ name: '', city: '', region: '', category: 'Historical', shortDescription: '', description: '', image: '', price: 0 });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not create place.');
    }
  };
  const fields = [['name', 'Name'], ['city', 'City'], ['region', 'Region'], ['shortDescription', 'Short description'], ['image', 'Photo URL']];
  return <section className="card admin-card"><div className="card-body p-4"><h1 className="h2 fw-bold">Admin · Add a place</h1><form className="row g-3 mt-2" onSubmit={create}>{fields.map(([field, label]) => <div className="col-md-6" key={field}><label className="form-label">{label}<input className="form-control mt-1" required value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label></div>)}<div className="col-md-6"><label className="form-label">Category<select className="form-select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="col-md-6"><label className="form-label">Estimated price in JOD<input type="number" min="0" className="form-control" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label></div><div className="col-12"><label className="form-label">Description<textarea className="form-control" required rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div><div className="col-12"><button className="btn btn-dark">Add place</button>{message && <span className="ms-3" role="status">{message}</span>}</div></form></div></section>;
}

function AuthPage({ mode }) {
  const { token, login, register, googleLogin } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  if (token) return <Navigate to="/" replace />;
  const isLogin = mode === 'login';
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setNeedsVerification(false);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
        navigate('/');
      } else {
        const result = await register(form);
        setNotice(result.message);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not authenticate.');
      setNeedsVerification(
        requestError.response?.data?.code === 'EMAIL_NOT_VERIFIED' ||
        (!isLogin && requestError.response?.status === 503)
      );
    }
  };
  const signInWithGoogle = async (credential) => {
    setError('');
    try {
      await googleLogin(credential);
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Google sign-in failed. Try again.');
    }
  };
  const resendVerification = async () => {
    setError('');
    setNotice('');
    setResending(true);
    try {
      const { data } = await api.post('/api/auth/resend-verification', { email: form.email });
      setNotice(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not resend your verification email.');
    } finally {
      setResending(false);
    }
  };
  return (
    <section className="card mx-auto auth-card">
      <div className="card-body p-4 p-md-5">
        <p className="eyebrow">{isLogin ? 'Welcome back' : 'Join the journey'}</p>
        <h1 className="h2 fw-bold">{isLogin ? 'Sign in' : 'Create your account'}</h1>
        {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
        {notice && <div className="alert alert-success mt-3" role="status">{notice}</div>}
        {needsVerification && <button className="btn btn-outline-secondary w-100" type="button" onClick={resendVerification} disabled={resending}>{resending ? 'Sending…' : 'Resend verification email'}</button>}
        <form className="vstack gap-3 mt-4" onSubmit={submit}>
          {!isLogin && <label className="form-label">Name<input className="form-control mt-1" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>}
          <label className="form-label">Email<input className="form-control mt-1" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="form-label">Password<input className="form-control mt-1" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength="6" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <button className="btn btn-warning">{isLogin ? 'Sign in' : 'Register'}</button>
        </form>
        {isLogin && <p className="small mt-3 mb-0"><Link to="/forgot-password">Forgot your password?</Link></p>}
        <div className="auth-divider"><span>or continue with</span></div>
        <GoogleSignInButton onCredential={signInWithGoogle} />
        <p className="mt-4 mb-0 small">{isLogin ? 'New here?' : 'Already registered?'} <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Sign in'}</Link></p>
      </div>
    </section>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-JO', { style: 'currency', currency: 'JOD', maximumFractionDigits: 2 }).format(Number(value) || 0);
}

export default App;
