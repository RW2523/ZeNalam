import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../apiClient";
import "./styles/SuryaModule.css";
import StarBackground from './StarBackground';
import ZenAppBar from "./ZenAppBar";

const SuryaModule = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [poses, setPoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/api/content/yoga-poses');
        if (!cancelled) {
          setPoses(Array.isArray(res.data) ? res.data : []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Could not load poses. Check the server and try again.");
          setPoses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const nextPose = () => {
    if (currentStep < poses.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevPose = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => setCurrentStep(0);
  const handleGoHome = () => navigate("/dashboard");

  const isLastStep = poses.length > 0 && currentStep === poses.length - 1;
  const pose = poses[currentStep];
  const publicBase = process.env.PUBLIC_URL || "";
  const imageSrc = pose
    ? (pose.imageUrl && pose.imageUrl.startsWith("http")
        ? pose.imageUrl
        : `${publicBase}${pose.imageUrl || ""}`)
    : "";

  if (loading) {
    return (
      <>
        <StarBackground />
        <ZenAppBar />
        <div className="surya-container">
          <p className="surya-status">Loading sequence…</p>
        </div>
      </>
    );
  }

  if (error || poses.length === 0) {
    return (
      <>
        <StarBackground />
        <ZenAppBar />
        <div className="surya-container">
          <p className="surya-error">{error || "No poses available."}</p>
          <div className="surya-controls">
            <button type="button" onClick={() => navigate("/dashboard")}>Dashboard</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
    <StarBackground />
    <ZenAppBar />
    <div className="surya-container">
      <h2 className="surya-title">{pose.title}</h2>
      <img src={imageSrc} alt="" className="pose-image" />
      <p className="pose-description">{pose.description}</p>

      <div className="surya-controls">
        <button type="button" onClick={prevPose} disabled={currentStep === 0}>
          Previous
        </button>
        {!isLastStep ? (
          <button type="button" onClick={nextPose}>Next</button>
        ) : (
          <>
            <button type="button" onClick={handleRestart}>Start again</button>
            <button type="button" onClick={handleGoHome}>Dashboard</button>
          </>
        )}
      </div>

      <div className="step-counter">
        Pose {currentStep + 1} of {poses.length}
      </div>
    </div>
    </>
  );
};

export default SuryaModule;
