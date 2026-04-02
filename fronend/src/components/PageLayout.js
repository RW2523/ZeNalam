import { Link } from 'react-router-dom';
import '../styles/page-shell.css';

export default function PageLayout({ title, subtitle, children, wide, noCard }) {
  return (
    <div className="page-shell">
      <header className="page-shell__header">
        <Link to="/dashboard" className="page-shell__back">
          ← Dashboard
        </Link>
        <span className="page-shell__brand">ZeNalam</span>
        <span className="page-shell__header-spacer" aria-hidden="true" />
      </header>
      <main
        className={`page-shell__main${wide ? ' page-shell__main--wide' : ''}`}
      >
        {noCard ? (
          <>
            {title && (
              <h1 className="page-shell__title page-shell__title--flush">{title}</h1>
            )}
            {subtitle && <p className="page-shell__subtitle">{subtitle}</p>}
            {children}
          </>
        ) : (
          <div className="page-shell__card">
            {title && <h1 className="page-shell__title">{title}</h1>}
            {subtitle && <p className="page-shell__subtitle">{subtitle}</p>}
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
