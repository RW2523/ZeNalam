import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { resumeZenSoundFromStorage, stopZenSoundscape } from './zenSoundscape';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SleepPrediction from './components/SleepPrediction';
import ProfilePage from './components/Profile';
import ConsultPage from './components/ConsultPage';
import Meal from './components/Meal';
import RequireAuth from './RequireAuth';

import LandingPage from "./components/LandingPage";
import UserInputSection from "./components/UserInputSection";
import BreathingModule from "./components/BreathingModule";
import SuryaModule from "./components/SuryaModule";
import PsychModule from "./components/PsychModule";
import GamesHub from './components/games/GamesHub';
import PeaceRipples from './components/games/PeaceRipples';
import PeaceBubbles from './components/games/PeaceBubbles';
import PeaceHarmony from './components/games/PeaceHarmony';
import PeaceStars from './components/games/PeaceStars';
import PeaceBloomGarden from './components/games/PeaceBloomGarden';
import PeaceFlowRiver from './components/games/PeaceFlowRiver';

// 👇 This is your full home page with scroll logic
function HomePage() {
  const inputRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleScroll = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => setShowDialog(true), 1000);
  };

  return (
    <>
      <LandingPage onStart={handleScroll} />
      <div ref={inputRef}>
        <UserInputSection showDialog={showDialog} />
      </div>
    </>
  );
}

const ZEN_ROUTES = new Set(['/zen', '/breathing', '/surya', '/psych']);

function ZenAmbienceController() {
  const { pathname } = useLocation();
  useEffect(() => {
    const onZen = ZEN_ROUTES.has(pathname);
    if (!onZen) {
      stopZenSoundscape();
      return;
    }
    resumeZenSoundFromStorage().catch(() => {});
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ZenAmbienceController />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/sleep_prediction" element={<RequireAuth><SleepPrediction /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/consult" element={<RequireAuth><ConsultPage /></RequireAuth>} />
        <Route path="/meal" element={<RequireAuth><Meal /></RequireAuth>} />
        <Route path="/games" element={<RequireAuth><GamesHub /></RequireAuth>} />
        <Route path="/games/ripples" element={<RequireAuth><PeaceRipples /></RequireAuth>} />
        <Route path="/games/bubbles" element={<RequireAuth><PeaceBubbles /></RequireAuth>} />
        <Route path="/games/harmony" element={<RequireAuth><PeaceHarmony /></RequireAuth>} />
        <Route path="/games/stars" element={<RequireAuth><PeaceStars /></RequireAuth>} />
        <Route path="/games/bloom" element={<RequireAuth><PeaceBloomGarden /></RequireAuth>} />
        <Route path="/games/flow" element={<RequireAuth><PeaceFlowRiver /></RequireAuth>} />

        <Route path="/zen" element={<HomePage />} />
        <Route path="/breathing" element={<BreathingModule />} />
        <Route path="/surya" element={<SuryaModule />} />
        <Route path="/psych" element={<PsychModule />} />
      </Routes>
    </Router>
  );
}

export default App;