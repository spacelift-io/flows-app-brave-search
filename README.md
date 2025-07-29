# Brave Search - Flows App

A comprehensive Flows app that provides web search, AI-powered summarization, and news search capabilities using the Brave Search API.

## Features

This app includes three powerful search blocks:

- **Web Search** - General web search with customizable parameters
- **Summarizer Search** - AI-powered search with content summarization (requires Pro AI plan)
- **News Search** - News-specific search with freshness filtering and pagination

## Setup

### 1. Get Your API Key

1. Visit the [Brave Search API Dashboard](https://api-dashboard.search.brave.com)
2. Sign up for a free account or log in
3. Subscribe to a plan (Free plan available)
4. Copy your API key from the dashboard

### 2. Install the App

1. Add the app to your Flows workspace
2. Paste your API key in the "API Key" configuration field
3. The app will automatically validate your key during installation

## Block Reference

### Web Search

Performs general web searches with comprehensive result data.

**Configuration:**

- `query` (required) - Search query string
- `count` (optional) - Number of results (1-20, default: 10)
- `country` (optional) - Country code for localization (e.g., 'us', 'gb', 'de')
- `language` (optional) - Language code (e.g., 'en', 'es', 'fr')
- `safesearch` (optional) - Safe search level: 'strict', 'moderate', or 'off'
- `units` (optional) - Unit system: 'metric' or 'imperial'

**Output:**

- `query` - The executed search query
- `results` - Array of web search results with title, URL, description, metadata, and more

### Summarizer Search

AI-powered search that provides content summarization and follow-up suggestions.

**Requirements:** Pro AI plan subscription

**Configuration:**

- `query` (required) - Search query to summarize
- `count` (optional) - Number of results for summarization (1-20, default: 10)
- `country` (optional) - Country code for localization
- `language` (optional) - Language code
- `entity_info` (optional) - Include additional entity information

**Output:**

- `query` - The executed search query
- `summary` - AI-generated summary text
- `sources` - Top source references used in the summary
- `followUps` - Suggested follow-up questions

### News Search

Specialized news search with recency filtering and pagination support.

**Configuration:**

- `query` (required) - News search query
- `count` (optional) - Number of results (1-20, default: 10)
- `country` (optional) - Country code for localized news
- `language` (optional) - Language code
- `spellcheck` (optional) - Enable automatic spell correction
- `freshness` (optional) - Filter by recency: 'pd' (day), 'pw' (week), 'pm' (month), 'py' (year)
- `offset` (optional) - Starting position for pagination (default: 0)

**Output:**

- `query` - The executed search query
- `results` - Array of news articles with title, URL, description, age, and metadata
- `totalCount` - Total number of available results

## Development

### Prerequisites

- Node.js and npm
- Flows CLI (`@useflows/flowctl`)

### Scripts

```bash
# Install dependencies
npm install

# Type checking
npm run typecheck

# Format code
npm run format

# Bundle the app
npm run bundle
```

### Project Structure

```
brave-search/
├── blocks/                   # Block implementations
│   ├── webSearch.ts         # Web search block
│   ├── summarizerSearch.ts  # AI summarizer block
│   └── newsSearch.ts        # News search block
├── utils/                   # Shared utilities
│   └── apiHelpers.ts        # API client and helpers
├── main.ts                  # App definition and configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### API Usage Notes

- All search operations require a valid API key
- Summarizer search requires a Pro AI plan subscription
- Rate limits depend on your Brave Search subscription level
- Results are returned in JSON format with comprehensive metadata

### Error Handling

The app includes robust error handling for:

- Missing or invalid API keys
- API connectivity issues
- Invalid query parameters
- Rate limiting
- Plan-specific feature restrictions

## License

This project is licensed under the terms specified in the LICENSE file.
