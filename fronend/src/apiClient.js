import axios from 'axios';
import { API_BASE_URL } from './config';

/** Single axios instance: base URL, timeouts, one place to add auth headers later. */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(process.env.REACT_APP_API_TIMEOUT_MS) || 90_000,
});

export const PREDICTION_TIMEOUT_MS = 120_000;

/** First food-model inference can download weights; keep generous. */
export const FOOD_CLASSIFY_TIMEOUT_MS = 180_000;
