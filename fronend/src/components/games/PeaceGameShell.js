import { Link } from 'react-router-dom';
import './games.css';

export default function PeaceGameShell({ title, hint, children }) {
  return (
    <div className="peace-game-page">
      <header className="peace-game-header">
        <Link to="/games" className="peace-game-back">
          ← Games
        </Link>
        <Link to="/dashboard" className="peace-game-back peace-game-back--muted">
          Dashboard
        </Link>
      </header>
      <main className="peace-game-main">
        <h1 className="peace-game-title">{title}</h1>
        {hint && <p className="peace-game-hint">{hint}</p>}
        {children}
      </main>
    </div>
  );
}
