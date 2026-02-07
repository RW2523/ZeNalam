import React from 'react';
import './styles/Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faStethoscope,
  faBed,
  faSpa,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../logo1.png'; // Adjust the path as needed

function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('id');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="App Logo" style={{ width: '50px', height: '50px', borderRadius: '8px' }} />
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/profile" title="Profile Details">
              <FontAwesomeIcon icon={faUser} className="fa-icon" />
            </Link>
          </li>
          <li>
            <Link to="/consult" title="Consult">
              <FontAwesomeIcon icon={faStethoscope} className="fa-icon" />
            </Link>
          </li>
          <li>
            <Link to="/sleep_prediction" title="Sleep Prediction">
              <FontAwesomeIcon icon={faBed} className="fa-icon" />
            </Link>
          </li>
          <li>
            <Link to="/zen" title="Zen Mode">
              <FontAwesomeIcon icon={faSpa} className="fa-icon" />
            </Link>
          </li>
          {/* <li>
            <Link to="/meal" title="Meal Classifier">
              <FontAwesomeIcon icon={faBed} className="fa-icon" />
            </Link>
          </li> */}
          <li>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="fa-icon" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
