import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

function Meal() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mealType, setMealType] = useState("Breakfast");
  const [quantity, setQuantity] = useState(100);
  const [predictions, setPredictions] = useState([]);
  const [manualFoodName, setManualFoodName] = useState("");
  const [mode, setMode] = useState("image");
  const [logs, setLogs] = useState([]);
  const [logsFetched, setLogsFetched] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const classifyImage = async () => {
    const formData = new FormData();
    formData.append("image", image);

    const res = await axios.post(`${API_BASE_URL}/api/auth/food`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const sortedPredictions = Object.entries(res.data)
      .map(([label, score]) => ({ label, score: parseFloat(score) }))
      .sort((a, b) => b.score - a.score);

    setPredictions(sortedPredictions);
  };

  const saveData = async (e) => {
    const id = localStorage.getItem("id");
    const data = {
      foodName: mode === "manual" ? manualFoodName : predictions[0]?.label,
      quantityInGrams: quantity,
      mealType,
      mealTime: new Date().toISOString(),
      user_id: id,
    };

    if (!data.foodName) return;
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/api/auth/meals`, data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const viewLogs = async () => {
    const id = localStorage.getItem("id");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/mealslog`, id != null ? String(id) : "", {
        headers: { "Content-Type": "application/json" },
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
      console.error("Failed to fetch meal logs:", err);
      setLogs([]);
    } finally {
      setLogsFetched(true);
    }
  };

  return (
    <div className="meal-container">
      <style dangerouslySetInnerHTML={{
        __html: `
          body {
            margin: 0;
            padding: 0;
            background-color: #d4f5ef;
            font-family: 'Segoe UI', sans-serif;
          }

          .meal-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 40px 20px;
            background-color: #d4f5ef;
          }

          .meal-card {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            padding: 30px 35px;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }

          h2 {
            text-align: center;
            color: #1e3a5f;
            margin-bottom: 25px;
            font-size: 28px;
          }

          .mode-switch {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 20px;
          }

          .image-preview {
            display: block;
            max-width: 100%;
            margin: 15px auto;
            border-radius: 10px;
          }

          .form-group {
            margin-bottom: 18px;
          }

          label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: #2c3e50;
          }

          input[type="text"],
          input[type="number"],
          select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 15px;
          }

          .input {
            margin-top: 10px;
            padding: 10px;
            width: 100%;
            box-sizing: border-box;
            font-size: 15px;
          }

          .primary-button,
          .save-button,
          .view-button {
            width: 100%;
            padding: 12px;
            background-color: #0d7490;
            border: none;
            color: white;
            font-size: 17px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 12px;
            transition: background-color 0.3s ease;
          }

          .primary-button:hover,
          .save-button:hover,
          .view-button:hover {
            background-color: #0b5d72;
          }

          .prediction-box {
            background: #e0f7fa;
            padding: 15px;
            border-radius: 10px;
            margin-top: 15px;
            border-left: 4px solid #0d7490;
          }

          .logs-section {
            margin-top: 25px;
            background: #f1f8e9;
            padding: 15px;
            border-radius: 10px;
          }

          .logs-section ul {
            padding-left: 20px;
          }

          .logs-section div {
            background: #fff;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 8px;
            margin-bottom: 10px;
          }
        `
      }} />

      <div className="meal-card">
        <h2>🍽️ Wellness Meal Logger</h2>

        <div className="mode-switch">
          <label>
            <input
              type="radio"
              value="image"
              checked={mode === "image"}
              onChange={() => setMode("image")}
            />
            Image Upload
          </label>
          <label>
            <input
              type="radio"
              value="manual"
              checked={mode === "manual"}
              onChange={() => setMode("manual")}
            />
            Manual Entry
          </label>
        </div>

        {mode === "image" ? (
          <div className="image-section">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {preview && <img src={preview} alt="Preview" className="image-preview" />}
            <button className="primary-button" onClick={classifyImage} disabled={!image}>Classify</button>
          </div>
        ) : (
          <input
            type="text"
            value={manualFoodName}
            onChange={(e) => setManualFoodName(e.target.value)}
            placeholder="Enter food name"
            className="input"
          />
        )}

        <div className="form-group">
          <label>Meal Type:</label>
          <select onChange={(e) => setMealType(e.target.value)} value={mealType}>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
          </select>
        </div>

        <div className="form-group">
          <label>Quantity (grams):</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="100"
            max="500"
            className="input"
          />
        </div>

        {predictions.length > 0 && mode === "image" && (
          <div className="prediction-box">
            <h4>Top Predictions:</h4>
            <ul>
              {predictions.map(p => (
                <li key={p.label}>{p.label} - {(p.score * 100).toFixed(1)}%</li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="save-button"
          onClick={saveData}
          disabled={mode === "image" && predictions.length === 0 && !manualFoodName}
        >
          Save Meal
        </button>

        <button className="view-button" onClick={viewLogs}>View Previous Logs</button>

        {logsFetched && (
          <div className="logs-section">
            <h4>Previous Logs:</h4>
            {logs.length > 0 ? (
              <ul>
                {logs.map((log, idx) => (
                  <div key={idx}>
                    <p><strong>Food:</strong> {log.foodName}</p>
                    <p><strong>Meal Type:</strong> {log.mealType}</p>
                    <p><strong>Quantity:</strong> {log.quantityInGrams} g</p>
                    <p><strong>Time:</strong> {log.mealTime}</p>
                  </div>
                ))}
              </ul>
            ) : (
              <p>No logs found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Meal;
