import React, { useState, useCallback } from "react";
import { api, FOOD_CLASSIFY_TIMEOUT_MS } from "../apiClient";
import PageLayout from "./PageLayout";
import "../styles/meal.css";

function humanizeFoodLabel(raw) {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Meal() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mealType, setMealType] = useState("Breakfast");
  const [quantity, setQuantity] = useState(250);
  const [predictions, setPredictions] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [manualFoodName, setManualFoodName] = useState("");
  const [mode, setMode] = useState("image");
  const [logs, setLogs] = useState([]);
  const [logsFetched, setLogsFetched] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyError, setClassifyError] = useState(null);

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const resetImage = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
    setPredictions([]);
    setSelectedLabel("");
    setClassifyError(null);
  }, [preview]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setPredictions([]);
    setSelectedLabel("");
    setClassifyError(null);
    setSaveMessage("");
    setSaveError("");
  };

  const classifyImage = async () => {
    if (!image) return;
    setClassifyLoading(true);
    setClassifyError(null);
    setSaveMessage("");
    setSaveError("");
    setPredictions([]);
    setSelectedLabel("");

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await api.post("/api/auth/food", formData, {
        timeout: FOOD_CLASSIFY_TIMEOUT_MS,
      });

      const data = res.data || {};
      if (data.error) {
        setClassifyError(String(data.error));
        return;
      }

      const entries = Object.entries(data).filter(([k]) => k !== "error");
      if (entries.length === 0) {
        setClassifyError("No predictions returned. Is the food model loaded on the server?");
        return;
      }

      const sorted = entries
        .map(([label, score]) => ({
          label,
          score: typeof score === "number" ? score : parseFloat(score),
        }))
        .filter((p) => !Number.isNaN(p.score))
        .sort((a, b) => b.score - a.score);

      setPredictions(sorted);
      if (sorted[0]) setSelectedLabel(sorted[0].label);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        (err.code === "ECONNABORTED"
          ? "Request timed out. The first run can take a few minutes while the model loads."
          : err.message) ||
        "Could not classify image.";
      setClassifyError(String(msg));
    } finally {
      setClassifyLoading(false);
    }
  };

  const effectiveFoodName =
    mode === "manual" ? manualFoodName.trim() : selectedLabel;

  const saveData = async (e) => {
    e.preventDefault();
    setSaveMessage("");
    setSaveError("");
    if (!effectiveFoodName) {
      setSaveError(mode === "manual" ? "Enter a food name." : "Classify the image and pick a label, or switch to manual entry.");
      return;
    }

    const id = localStorage.getItem("id");
    const qty = Number(quantity);
    const data = {
      foodName: effectiveFoodName,
      quantityInGrams: Number.isFinite(qty) ? qty : 100,
      mealType,
      mealTime: new Date().toISOString(),
      user_id: id,
    };

    try {
      await api.post("/api/auth/meals", data, {
        headers: { "Content-Type": "application/json" },
      });
      setSaveMessage("Meal saved to your log.");
    } catch (error) {
      const msg = error.response?.data?.error || error.message || "Save failed.";
      setSaveError(String(msg));
    }
  };

  const viewLogs = async () => {
    const id = localStorage.getItem("id");
    const userId = id != null && id !== "" ? Number(id) : null;
    setLogsLoading(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const res = await api.get("/api/auth/mealslog", {
        params: userId != null && !Number.isNaN(userId) ? { userId } : {},
      });

      if (res.data.mealLogs) {
        const parsedLogs = Array.isArray(res.data.mealLogs)
          ? res.data.mealLogs
          : res.data.mealLogs.split(",").map((item) => item.trim());

        setLogs(parsedLogs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setLogs([]);
      setSaveError(err.response?.data?.error || "Could not load meal logs.");
    } finally {
      setLogsFetched(true);
      setLogsLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setSaveMessage("");
    setSaveError("");
    setClassifyError(null);
    if (next === "manual") {
      resetImage();
    }
  };

  return (
    <PageLayout
      title="Smart meal log"
      subtitle="Photo classification runs on the ML service (Python). You can override labels and save to your account."
      wide
      noCard
    >
      <div className="meal-layout">
        <section className="meal-panel meal-panel--primary" aria-labelledby="meal-panel-log">
          <h2 id="meal-panel-log" className="meal-panel__title">
            Log a meal
          </h2>
          <p className="meal-panel__hint">
            Tip: first-time food classification may take 1–3 minutes while the model downloads.
          </p>

          <div className="meal-steps" role="tablist" aria-label="Entry mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "image"}
              className={`meal-step-tab${mode === "image" ? " meal-step-tab--active" : ""}`}
              onClick={() => switchMode("image")}
            >
              1 · Photo
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "manual"}
              className={`meal-step-tab${mode === "manual" ? " meal-step-tab--active" : ""}`}
              onClick={() => switchMode("manual")}
            >
              2 · Manual
            </button>
          </div>

          {mode === "image" ? (
            <div className="meal-photo-block">
              <label className="meal-dropzone">
                <input
                  type="file"
                  accept="image/*"
                  className="meal-dropzone__input"
                  onChange={handleImageUpload}
                />
                <span className="meal-dropzone__text">
                  {image ? image.name : "Tap to choose a meal photo"}
                </span>
              </label>
              {preview && (
                <img src={preview} alt="Selected meal preview" className="meal-image-preview" />
              )}
              <button
                type="button"
                className="meal-btn meal-btn--secondary"
                onClick={classifyImage}
                disabled={!image || classifyLoading}
              >
                {classifyLoading ? "Analyzing image…" : "Run food classifier"}
              </button>
            </div>
          ) : (
            <div className="meal-manual-block">
              <label className="meal-field-label" htmlFor="meal-manual-name">
                Food name
              </label>
              <input
                id="meal-manual-name"
                type="text"
                value={manualFoodName}
                onChange={(e) => setManualFoodName(e.target.value)}
                placeholder="e.g. Greek salad"
                className="meal-input-full"
              />
            </div>
          )}

          {classifyError && (
            <div className="meal-alert meal-alert--error" role="alert">
              {classifyError}
            </div>
          )}

          {predictions.length > 0 && mode === "image" && (
            <div className="meal-predictions">
              <h3 className="meal-predictions__title">Pick the best match</h3>
              <div className="meal-chips" role="group" aria-label="Food predictions">
                {predictions.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className={`meal-chip${selectedLabel === p.label ? " meal-chip--selected" : ""}`}
                    onClick={() => setSelectedLabel(p.label)}
                  >
                    <span className="meal-chip__name">{humanizeFoodLabel(p.label)}</span>
                    <span className="meal-chip__score">{(p.score * 100).toFixed(1)}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="meal-save-form" onSubmit={saveData}>
            <div className="meal-form-row">
              <div className="meal-form-group meal-form-group--half">
                <label htmlFor="meal-type">Meal</label>
                <select
                  id="meal-type"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </div>
              <div className="meal-form-group meal-form-group--half">
                <label htmlFor="meal-qty">Quantity (g)</label>
                <input
                  id="meal-qty"
                  type="number"
                  min={1}
                  max={5000}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              className="meal-btn"
              disabled={!effectiveFoodName || quantity === "" || Number(quantity) < 1}
            >
              Save to log
            </button>
          </form>

          {saveMessage && (
            <div className="meal-alert meal-alert--success" role="status">
              {saveMessage}
            </div>
          )}
          {saveError && (
            <div className="meal-alert meal-alert--error" role="alert">
              {saveError}
            </div>
          )}
        </section>

        <section className="meal-panel meal-panel--side" aria-labelledby="meal-panel-history">
          <h2 id="meal-panel-history" className="meal-panel__title">
            Your history
          </h2>
          <button
            type="button"
            className="meal-btn meal-btn--ghost"
            onClick={viewLogs}
            disabled={logsLoading}
          >
            {logsLoading ? "Loading…" : "Refresh meal log"}
          </button>

          {logsFetched && (
            <div className="meal-logs-section">
              {logs.length > 0 ? (
                <ul className="meal-log-list">
                  {logs.map((log, idx) => (
                    <li key={idx} className="meal-log-item">
                      <p className="meal-log-item__food">{humanizeFoodLabel(log.foodName)}</p>
                      <p className="meal-log-item__meta">
                        {log.mealType} · {log.quantityInGrams} g
                      </p>
                      <p className="meal-log-item__time">{log.mealTime}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="meal-empty">No meals logged yet.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}

export default Meal;
