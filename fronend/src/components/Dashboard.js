import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Overview from './Overview';
import ActivityCards from './ActivityCards';
import WellnessQuotes from './WellnessQuotes';
import FriendsList from './FriendsList';
import '../App.css';

function Dashboard() {
  return (
    <div className="app">
    <Sidebar />
    <div className="main-content">
      <Header />
      <Overview />
      <div className="dashboard-mid">
        <div className="dashboard-mid-main">
          <ActivityCards />
        </div>
        <aside className="dashboard-aside">
          <FriendsList />
        </aside>
      </div>
    </div>
    <WellnessQuotes />
  </div>
  );
}

export default Dashboard;
