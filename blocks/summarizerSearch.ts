import { AppBlock, events } from "@slflows/sdk/v1";
import {
  makeRequest,
  validateQuery,
  sanitizeQuery,
} from "../utils/apiHelpers.js";

export const summarizerSearch: AppBlock = {
  name: "Summarizer Search",
  category: "Search",
  description:
    "AI-powered search with content summarization (requires Pro AI plan)",
  inputs: {
    default: {
      config: {
        query: {
          name: "Search Query",
          description: "The search query to execute and summarize",
          type: "string",
          required: true,
        },
        count: {
          name: "Result Count",
          description:
            "Number of results to return for summarization (1-20, default: 10)",
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
        entity_info: {
          name: "Include Entity Info",
          description: "Include additional entity information in results",
          type: "boolean",
          required: false,
        },
      },
      onEvent: async ({ app, event }) => {
        const { query, count, country, language, entity_info } =
          event.inputConfig;

        // Validate input
        validateQuery(query);

        // Step 1: Search with summary flag
        const searchParams: Record<string, any> = {
          q: sanitizeQuery(query),
          summary: 1, // Enable summarizer
        };

        if (count !== undefined) {
          if (count < 1 || count > 20) {
            throw new Error("Count must be between 1 and 20");
          }
          searchParams.count = count;
        }

        if (country) searchParams.country = country;
        if (language) searchParams.search_lang = language;
        if (entity_info) searchParams.entity_info = 1;

        // Make initial search request
        const searchResults = await makeRequest(
          { apiKey: app.config.apiKey },
          "https://api.search.brave.com/res/v1/web/search",
          searchParams,
        );

        // Check if we got a summarizer key
        const summarizerKey = (searchResults as any).summarizer?.key;
        if (!summarizerKey) {
          throw new Error(
            "No summarizer key returned. This feature requires a Pro AI plan.",
          );
        }

        // Step 2: Get summary using the key
        const summaryResults = await makeRequest(
          { apiKey: app.config.apiKey },
          "https://api.search.brave.com/res/v1/summarizer/search",
          { key: summarizerKey },
        );

        // Extract summary text and sources for AI bot consumption
        const summaryText =
          (summaryResults as any).summary
            ?.map((item: any) => item.data)
            .join("") || "";
        const sources = ((searchResults as any).web?.results || [])
          .slice(0, 5)
          .map((result: any) => ({
            title: result.title,
            url: result.url,
          }));
        const followUps = (summaryResults as any).followups || [];

        await events.emit({
          query: searchParams.q,
          summary: summaryText,
          sources: sources,
          followUps: followUps,
        });
      },
    },
  },
  outputs: {
    default: {
      type: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query used",
          },
          summary: {
            type: "string",
            description:
              "AI-generated summary text from Brave Search summarizer",
          },
          sources: {
            type: "array",
            description: "Top source references used in the summary",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                url: { type: "string" },
              },
              required: ["title", "url"],
            },
          },
          followUps: {
            type: "array",
            description: "Suggested follow-up questions",
            items: { type: "string" },
          },
        },
        required: ["query", "summary"],
      },
    },
  },
};
