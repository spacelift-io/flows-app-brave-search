import { defineApp } from "@slflows/sdk/v1";
import { webSearch } from "./blocks/webSearch.js";
import { summarizerSearch } from "./blocks/summarizerSearch.js";
import { newsSearch } from "./blocks/newsSearch.js";

export const app = defineApp({
  name: "Brave Search",
  installationInstructions: `
## Setup Instructions

1. **Get your API key**:
   - Go to [Brave Search API Dashboard](https://api-dashboard.search.brave.com)
   - Sign up for a free account or log in
   - Subscribe to a plan (Free plan available)
   - Copy your API key from the dashboard

2. **Configure the app**:
   - Paste your API key in the "API Key" field below
   - The app will validate your key during installation

## Features

This app provides three types of search functionality:

- **Web Search**: General web search with standard results
- **Summarizer Search**: AI-powered search with content summarization
- **News Search**: News-specific search with filtering options

## Usage Notes

- All search operations require a valid API key
- Summarizer search requires a Pro AI plan
- Rate limits depend on your subscription level
`,
  config: {
    apiKey: {
      name: "API Key",
      description: "Your Brave Search API key (X-Subscription-Token)",
      type: "string",
      required: true,
      sensitive: true,
    },
  },
  blocks: {
    webSearch,
    summarizerSearch,
    newsSearch,
  },
  async onSync(input) {
    const { apiKey } = input.app.config;

    if (!apiKey) {
      return {
        newStatus: "failed",
        customStatusDescription: "API Key is required",
      };
    }

    // Test API connectivity with a simple search
    try {
      const response = await fetch(
        "https://api.search.brave.com/res/v1/web/search?q=test&count=1",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": apiKey,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API test failed:", response.status, errorText);
        return {
          newStatus: "failed",
          customStatusDescription: `API authentication failed: ${response.status} ${response.statusText}`,
        };
      }

      return { newStatus: "ready" };
    } catch (error) {
      console.error("API test error:", error);
      return {
        newStatus: "failed",
        customStatusDescription:
          "Failed to connect to Brave Search API. Check your internet connection and API key.",
      };
    }
  },
});
