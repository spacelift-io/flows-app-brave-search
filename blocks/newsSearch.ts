import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeRequest,
  validateQuery,
  sanitizeQuery,
} from "../utils/apiHelpers.js";

export const newsSearch: AppBlock = {
  name: "News Search",
  category: "Search",
  description: "Search for news articles using Brave Search API",
  inputs: {
    default: {
      config: {
        query: {
          name: "Search Query",
          description: "The news search query to execute",
          type: "string",
          required: true,
        },
        count: {
          name: "Result Count",
          description: "Number of news results to return (1-20, default: 10)",
          type: "number",
          required: false,
        },
        country: {
          name: "Country",
          description:
            "Country code for localized news (e.g., 'us', 'gb', 'de')",
          type: "string",
          required: false,
        },
        language: {
          name: "Search Language",
          description: "Language code for news search (e.g., 'en', 'es', 'fr')",
          type: "string",
          required: false,
        },
        spellcheck: {
          name: "Enable Spellcheck",
          description: "Enable automatic spell correction for the query",
          type: "boolean",
          required: false,
        },
        freshness: {
          name: "Freshness",
          description: "Filter results by recency",
          type: {
            type: "string",
            enum: ["pd", "pw", "pm", "py"], // past day, week, month, year
          },
          required: false,
        },
        offset: {
          name: "Offset",
          description: "Starting position for pagination (default: 0)",
          type: "number",
          required: false,
        },
      },
      onEvent: async ({ app, event }) => {
        const {
          query,
          count,
          country,
          language,
          spellcheck,
          freshness,
          offset,
        } = event.inputConfig;

        // Validate input
        validateQuery(query);

        // Prepare query parameters
        const queryParams: Record<string, any> = {
          q: sanitizeQuery(query),
        };

        if (count !== undefined) {
          if (count < 1 || count > 20) {
            throw new Error("Count must be between 1 and 20");
          }
          queryParams.count = count;
        }

        if (country) queryParams.country = country;
        if (language) queryParams.search_lang = language;
        if (spellcheck !== undefined)
          queryParams.spellcheck = spellcheck ? 1 : 0;
        if (freshness) queryParams.freshness = freshness;
        if (offset !== undefined) {
          if (offset < 0) {
            throw new Error("Offset must be a non-negative number");
          }
          queryParams.offset = offset;
        }

        console.log("Executing news search:", {
          query: queryParams.q,
          params: queryParams,
        });

        // Make API request
        const results = await makeRequest(
          { apiKey: app.config.apiKey },
          "https://api.search.brave.com/res/v1/news/search",
          queryParams,
        );

        await events.emit({
          query: queryParams.q,
          results: (results as any).results || [],
          totalCount: (results as any).totalCount || 0,
        });
      },
    },
  },
  outputs: {
    default: {
      type: {
        type: "object",
        properties: {
          query: { type: "string" },
          results: {
            type: "array",
            description: "Array of news search results",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                url: { type: "string" },
                description: { type: "string" },
                age: { type: "string" },
                breaking: { type: "boolean" },
                page_age: { type: "string" },
                meta_url: {
                  type: "object",
                  properties: {
                    hostname: { type: "string" },
                    scheme: { type: "string" },
                    netloc: { type: "string" },
                    path: { type: "string" },
                  },
                },
                thumbnail: {
                  type: "object",
                  properties: {
                    src: { type: "string" },
                    original: { type: "string" },
                  },
                },
                language: { type: "string" },
                family_friendly: { type: "boolean" },
              },
              required: ["title", "url", "description"],
            },
          },
          totalCount: { type: "number" },
        },
        required: ["query", "results"],
      },
    },
  },
};
