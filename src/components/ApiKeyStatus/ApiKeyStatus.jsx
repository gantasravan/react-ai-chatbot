import { useMemo } from "react";
import styles from "./ApiKeyStatus.module.css";

const API_KEYS = {
  googleai: import.meta.env.VITE_GOGGLE_AI_API_KEY,
  openai: import.meta.env.VITE_OPEN_AI_API_KEY,
  deepseekai: import.meta.env.VITE_DEEPSEEK_AI_API_KEY,
  anthropicai: import.meta.env.VITE_ANTHROPIC_AI_API_KEY,
  xai: import.meta.env.VITE_X_AI_API_KEY,
};

export function ApiKeyStatus() {
  const availableProviders = useMemo(() => {
    return Object.entries(API_KEYS)
      .filter(([_, key]) => key && key !== 'your-actual-api-key' && !key.includes('your-'))
      .map(([provider]) => provider);
  }, []);

  const hasAnyKey = availableProviders.length > 0;

  if (hasAnyKey) return null;

  return (
    <div className={styles.ApiKeyStatus}>
      <h3>⚠️ No API Keys Configured</h3>
      <p>Please add at least one API key to use the chatbot:</p>
      <ul>
        <li>VITE_DEEPSEEK_AI_API_KEY (Recommended - Free tier)</li>
        <li>VITE_OPEN_AI_API_KEY</li>
        <li>VITE_GOGGLE_AI_API_KEY</li>
        <li>VITE_ANTHROPIC_AI_API_KEY</li>
        <li>VITE_X_AI_API_KEY</li>
      </ul>
    </div>
  );
}