import { useEffect, useMemo, useState } from 'react';
import { request } from './api.js';
import CourseCard from './components/CourseCard.jsx';
import NetworkInspector from './components/NetworkInspector.jsx';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    request('/courses')
      .then((r) => { if (!cancelled) { setCourses(r.data); setStatus('ready'); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? courses.filter((c) => c.title.toLowerCase().includes(q) || c.category.includes(q)) : courses;
  }, [courses, query]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-header">
        <h1>LearnHub</h1>
        <nav aria-label="Primary">
          <a href="#catalog">Catalog</a>
          <a href="#inspector">HTTP Inspector</a>
        </nav>
      </header>
      <main id="main">
        <section id="catalog" aria-labelledby="catalog-title">
          <h2 id="catalog-title">Course catalog</h2>
          <label htmlFor="search">Search courses</label>
          <input id="search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. flexbox" />
          {status === 'loading' && <p role="status">Loading…</p>}
          {status === 'error' && <p role="alert" className="error">Could not load courses: {error}</p>}
          {status === 'ready' && visible.length === 0 && <p>No courses match “{query}”.</p>}
          <div className="grid">{visible.map((c) => <CourseCard key={c._id} course={c} />)}</div>
        </section>
        <section id="inspector" aria-labelledby="insp-title">
          <h2 id="insp-title">HTTP inspector</h2>
          <NetworkInspector />
        </section>
      </main>
      <footer><p>© LearnHub, a Web Fundamentals assessment project</p></footer>
    </>
  );
}
