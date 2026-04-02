import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/UserInputSection.css";
import StarBackground from './StarBackground';
import ZenAppBar from "./ZenAppBar";

const UserInputSection = ({ showDialog }) => {
  const [selected, setSelected] = useState("");
  const [duration, setDuration] = useState(1); // session duration in minutes
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!selected) return;
    if (selected === "Surya Namaskar") {
      navigate("/surya");
    }
    if (selected === "Breathing") {
      navigate("/breathing", {
        state: {
          durationInMinutes: duration,
        },
      });
    }
    if (selected === "Psychological Check") {
      navigate("/psych");
    }
  };

  const options = ["Breathing", "Surya Namaskar", "Psychological Check"];

  return (
    <>
    <StarBackground />
    <ZenAppBar />
    <div className="user-input-section">
      {showDialog && (
        <div className="dialog-box">
          <h2>Welcome to Calm Studio</h2>
          <p>What would you like to focus on today?</p>
          <div className="options">
            {options.map((option) => (
              <button
                type="button"
                key={option}
                className={`option-button ${selected === option ? "active" : ""}`}
                onClick={() => setSelected(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {selected === "Breathing" && (
            <div className="duration-input">
              <label>How many minutes would you like to breathe?</label>
              <input
                type="number"
                min="1"
                max="60"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          )}

          <button type="button" className="continue-btn" onClick={handleSubmit} disabled={!selected}>
            Continue
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default UserInputSection;
