import { Link } from 'react-router-dom';
export default function NotFound() { return <section className="mx-auto max-w-3xl px-6 py-24"><h1>Page not found</h1><p>The requested page is unavailable.</p><Link to="/services">Explore services</Link></section>; }
