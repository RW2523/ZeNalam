import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../apiClient";
import "./styles/PsychModule.css";
import StarBackground from './StarBackground';
import ZenAppBar from "./ZenAppBar";

const PsychModule = () => {
  const [step, setStep] = useState(-1);
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/api/content/psych-questions');
        if (!cancelled) {
          setQuestions(Array.isArray(res.data) ? res.data : []);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError("Could not load assessment. Check the server and try again.");
          setQuestions([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const currentQuestion = questions[step];

  const handleAnswer = (value) => {
    setResponses([...responses, value]);
    setStep(step + 1);
  };

  const restart = () => {
    setStep(-1);
    setResponses([]);
  };

  const getSummary = () => {
    if (responses.length === 0) return "";
    const total = responses.reduce((a, b) => a + b, 0);
    const average = total / responses.length;

    if (average >= 8) return "You seem calm and focused today.";
    if (average >= 5) return "You're doing okay, with some room to ease tension.";
    return "You may be carrying significant stress or fatigue. Consider a short break or support.";
  };

  return (
    <>
    <StarBackground />
    <ZenAppBar />
    <div className="psych-container">
      {loadError && step === -1 && (
        <div className="intro">
          <p className="psych-error">{loadError}</p>
          <button type="button" className="action-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      )}

      {!loadError && step === -1 && (
        <div className="intro">
          <h2>Psychological assessment</h2>
          <p>We&apos;ll ask you {questions.length || "…"} short questions to understand how you&apos;re feeling today.</p>
          <button type="button" className="action-btn" onClick={() => questions.length > 0 && setStep(0)} disabled={questions.length === 0}>
            Start assessment
          </button>
        </div>
      )}

      {!loadError && step >= 0 && step < questions.length && (
        <div className="question-block">
          <h3>Question {step + 1} of {questions.length}</h3>
          <p className="question-text">{currentQuestion}</p>
          <div className="answer-scale">
            {[...Array(10)].map((_, i) => (
              <button type="button" key={i} className="big-answer" onClick={() => handleAnswer(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
          <p className="scale-label">1 = Very low, 10 = Very high</p>
        </div>
      )}

      {!loadError && questions.length > 0 && step === questions.length && (
        <div className="result-block">
          <h2>Assessment complete</h2>
          <p>{getSummary()}</p>
          <div className="session-actions">
            <button type="button" className="action-btn" onClick={restart}>Retake assessment</button>
            <button type="button" className="action-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default PsychModule;
