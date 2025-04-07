import { Client } from "@upstash/workflow";

export const workflowClient = new Client({
  baseUrl: "https://qstash.upstash.io",
  token: process.env.QSTASH_TOKEN!,
});

// Helper to get the correct base URL for workflow endpoints
export const getWorkflowBaseUrl = () => {
  // In production, use the actual deployment URL
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_APP_URL || "";
  }
  
  // In development, use the ngrok URL
  return "https://seemingly-top-stork.ngrok-free.app";
};
