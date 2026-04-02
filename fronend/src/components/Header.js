import React from 'react';
import './styles/Header.css';

function initialsFromName(name, email) {
  const n = (name || '').trim();
  if (n.length >= 2) {
    const parts = n.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const e = (email || '').split('@')[0] || '?';
  return e.slice(0, 2).toUpperCase();
}

const Header = () => {
  const name = typeof localStorage !== 'undefined' ? localStorage.getItem('userName') || '' : '';
  const email = typeof localStorage !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
  const display = name || email || 'Member';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-titles">
          <h1>ZeNalam</h1>
          <p className="header-greeting">Welcome back, {display}</p>
        </div>
        <div className="header-right">
          <div className="profile-avatar" aria-hidden="true">
            {initialsFromName(name, email)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
