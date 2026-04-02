import StarBackground from './StarBackground';
import React from "react";
import ZenAppBar from "./ZenAppBar";
import ZenMomentCard from "./ZenMomentCard";
import "./styles/LandingPage.css";

const LandingPage = ({ onStart }) => {
  return (
    <>
    <StarBackground />
    <ZenAppBar />
    <div className="landing-page">
      <div className="center-content">
        <ZenMomentCard />
        <h1 className="title">
          Calm <span className="title-accent">Studio</span>
        </h1>
        <p className="subtitle">
          Breathe. Relax. Renew. The bar above has a Sound menu—rain, white noise, pink calm, gentle nature ambience, or soft shimmer.
        </p>
        <button type="button" className="start-button" onClick={onStart}>
          Let’s begin
        </button>
      </div>
    </div>
  </>
  );
};

export default LandingPage;

