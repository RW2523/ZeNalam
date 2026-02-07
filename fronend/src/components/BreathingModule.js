import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/BreathingModule.css";
import StarBackground from './StarBackground';

const BreathingModule = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const durationInMinutes = location.state?.durationInMinutes || 1;
  const maxBreathingSeconds = durationInMinutes * 60;

  const [phase, setPhase] = useState("settle");
  const [countdown, setCountdown] = useState(10);
  const [breathePhase, setBreathePhase] = useState("Exhale");
  const [justStartedBreathing, setJustStartedBreathing] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [showCircle, setShowCircle] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const formatTime = (totalSeconds) => {
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleEndSession = () => {
  setSessionComplete(true);
  setPhase("done");
  setShowCircle(false); // force-hide the circle
  };



  // SETTLE PHASE → countdown then start breathing
  useEffect(() => {
    if (phase === "settle" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (phase === "settle" && countdown === 0) {
      setPhase("breathe");
      setCountdown(6);
      setBreathePhase("Exhale");
      setShowCircle(true);
      setJustStartedBreathing(true);

      // let the DOM render 'exhale' first, then switch to 'inhale'
      setTimeout(() => {
        setBreathePhase("Inhale");
        setCountdown(6);
        setCycles(1);
        setTotalElapsed(0);
        setJustStartedBreathing(false);
      }, 10);
    }
  }, [phase, countdown]);

  // BREATHING LOOP
  useEffect(() => {
    if (phase === "breathe" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
        setTotalElapsed((t) => {
          const updated = t + 1;
          if (updated >= maxBreathingSeconds) {
            setSessionComplete(true);
            setPhase("done");
          }
          return updated;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (phase === "breathe" && countdown === 0) {
      const next = breathePhase === "Inhale" ? "Exhale" : "Inhale";
      setBreathePhase(next);
      setCountdown(6);
      if (next === "Inhale") setCycles((c) => c + 1);
    }
  }, [phase, countdown, breathePhase, maxBreathingSeconds]);

  const timeRemaining = Math.max(maxBreathingSeconds - totalElapsed, 0);

  return (
    <>
    <StarBackground />
    <div className="breathing-container">
      {phase === "breathe" && (
        <div className="session-header">
          <div className="session-timer">
            {formatTime(timeRemaining)}
          </div>
          <button className="end-btn" onClick={handleEndSession}>
            End Session
          </button>
        </div>
      )}

      {showCircle && !sessionComplete &&  (
        <div
          className={`circle ${
            justStartedBreathing ? "exhale" : breathePhase.toLowerCase()
          }`}
        >
          <h2>{breathePhase}</h2>
          <p>{countdown}s</p>
          <p>Cycle #{cycles}</p>
        </div>
      )}

      <div className="breathing-info">
        {phase === "settle" && countdown > 0 && (
          <>
            <p>Take a moment to settle down</p>
            <p>
              Starting in {countdown} second{countdown !== 1 ? "s" : ""}...
            </p>
          </>
        )}

        {sessionComplete && (
          <div className="session-complete">
            <h2>Session Complete</h2>
            <p>
              Well done! You completed {durationInMinutes}{" "}
              minute{durationInMinutes > 1 ? "s" : ""} of calm breathing.
            </p>

            <div className="session-actions">
              <button className="action-btn" onClick={() => window.location.reload()}>
                Start Again
              </button>
              <button className="action-btn" onClick={() => navigate("/dashboard")}>
                Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
};

export default BreathingModule;
