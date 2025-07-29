import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeRequest,
  validateQuery,
  sanitizeQuery,
} from "../utils/apiHelpers.js";

export const webSearch: AppBlock = {
  name: "Web Search",
  category: "Search",
  description: "Search the web using Brave Search API",
  inputs: {
    default: {
      config: {
        query: {
          name: "Search Query",
          description: "The search query to execute",
          type: "string",
          required: true,
        },
        count: {
          name: "Result Count",
          description: "Number of results to return (1-20, default: 10)",
          type: "number",
          required: false,
        },
        country: {
          name: "Country",
          description:
            "Country code for localized results (e.g., 'us', 'gb', 'de')",
          type: "string",
          required: false,
        },
        language: {
          name: "Search Language",
          description: "Language code for search (e.g., 'en', 'es', 'fr')",
          type: "string",
          required: false,
        },
        safesearch: {
          name: "Safe Search",
          description: "Safe search setting",
          type: {
            type: "string",
            enum: ["strict", "moderate", "off"],
          },
          required: false,
        },
        units: {
          name: "Units",
          description: "Unit system for measurements",
          type: {
            type: "string",
            enum: ["metric", "imperial"],
          },
          required: false,
        },
      },
      onEvent: async ({ app, event }) => {
        const { query, count, country, language, safesearch, units } =
          event.inputConfig;

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
        if (safesearch) queryParams.safesearch = safesearch;
        if (units) queryParams.units = units;

        console.log("Executing web search:", {
          query: queryParams.q,
          params: queryParams,
        });

        // Make API request
        const results = await makeRequest(
          { apiKey: app.config.apiKey },
          "https://api.search.brave.com/res/v1/web/search",
          queryParams,
        );

        await events.emit({
          query: queryParams.q,
          results: (results as any).web?.results || [],
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
            description: "Array of web search results",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                url: { type: "string" },
                description: { type: "string" },
                type: { type: "string" },
                subtype: { type: "string" },
                family_friendly: { type: "boolean" },
                language: { type: "string" },
                meta_url: {
                  type: "object",
                  properties: {
                    hostname: { type: "string" },
                    netloc: { type: "string" },
                    path: { type: "string" },
                    scheme: { type: "string" },
                    favicon: { type: "string" },
                  },
                },
                profile: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    long_name: { type: "string" },
                    url: { type: "string" },
                    img: { type: "string" },
                  },
                },
                extra_snippets: {
                  type: "array",
                  items: { type: "string" },
                },
                thumbnail: {
                  type: "object",
                  properties: {
                    src: { type: "string" },
                    original: { type: "string" },
                    logo: { type: "boolean" },
                  },
                },
                age: { type: "string" },
                page_age: { type: "string" },
                is_live: { type: "boolean" },
              },
              required: ["title", "url", "description"],
            },
          },
        },
        required: ["query", "results"],
      },
    },
  },
};
