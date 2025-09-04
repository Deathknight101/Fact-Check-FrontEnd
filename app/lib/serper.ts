// Serper API integration for web search
export interface SerperSearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  source?: string;
}

export interface SerperResponse {
  searchInformation: {
    totalResults: string;
    time: string;
  };
  organic: SerperSearchResult[];
  answerBox?: {
    answer: string;
    title: string;
    link: string;
  };
}

export interface SearchContext {
  results: SerperSearchResult[];
  answerBox?: {
    answer: string;
    title: string;
    link: string;
  };
  searchTime: string;
  totalResults: string;
}

export async function searchBengaliNews(
  query: string,
  numResults: number = 5
): Promise<SearchContext> {
  const apiKey =
    import.meta.env.VITE_SERPER_API_KEY || "your_serper_api_key_here";

  if (apiKey === "your_serper_api_key_here") {
    throw new Error(
      "Please set your Serper API key in the environment variables"
    );
  }

  try {
    // Enhance query for Bengali news search
    const enhancedQuery = enhanceQueryForBengaliNews(query);

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: enhancedQuery,
        num: numResults,
        gl: "bd", // Bangladesh
        hl: "bn", // Bengali language
        safe: "active",
        type: "search",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Serper API error: ${response.status} ${response.statusText}`
      );
    }

    const data: SerperResponse = await response.json();

    return {
      results: data.organic || [],
      answerBox: data.answerBox,
      searchTime: data.searchInformation?.time || "0",
      totalResults: data.searchInformation?.totalResults || "0",
    };
  } catch (error) {
    console.error("Error calling Serper API:", error);
    throw new Error(
      `Failed to search: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function enhanceQueryForBengaliNews(query: string): string {
  // Add Bengali news site filters
  const bengaliNewsSites = [
    "site:prothomalo.com",
    "site:thedailystar.net",
    "site:bbc.com/bengali",
    "site:bdnews24.com",
    "site:jugantor.com",
    "site:ittefaq.com.bd",
    "site:samakal.com",
    "site:banglanews24.com",
  ];

  // Add temporal keywords for recent news
  const temporalKeywords = ["সাম্প্রতিক", "আজ", "গত সপ্তাহ", "২০২৪", "২০২৩"];

  // Create enhanced query
  const siteFilter = bengaliNewsSites.slice(0, 3).join(" OR "); // Use top 3 sites
  const temporalFilter = temporalKeywords[0]; // Use most recent

  return `(${siteFilter}) (${temporalFilter}) "${query}"`;
}

export async function searchMultipleQueries(
  baseQuery: string,
  numResults: number = 3
): Promise<SearchContext[]> {
  // Generate multiple search queries for comprehensive results
  const queries = [
    baseQuery, // Original query
    `${baseQuery} সরকারি`, // Government sources
    `${baseQuery} সংবাদ`, // News specific
    `${baseQuery} সত্যতা`, // Fact-checking specific
  ];

  try {
    const searchPromises = queries.map((query) =>
      searchBengaliNews(query, numResults)
    );

    const results = await Promise.all(searchPromises);
    return results;
  } catch (error) {
    console.error("Error in multiple search queries:", error);
    // Return empty results if search fails
    return [];
  }
}

export function formatSearchContextForPrompt(
  contexts: SearchContext[]
): string {
  let contextString = "=== SEARCH RESULTS FOR FACT-CHECKING ===\n\n";

  contexts.forEach((context, index) => {
    if (context.results.length > 0) {
      contextString += `Search ${index + 1} Results:\n`;
      contextString += `Total Results: ${context.totalResults}\n`;
      contextString += `Search Time: ${context.searchTime}ms\n\n`;

      context.results.forEach((result, resultIndex) => {
        contextString += `${resultIndex + 1}. ${result.title}\n`;
        contextString += `   Source: ${result.link}\n`;
        contextString += `   Snippet: ${result.snippet}\n`;
        if (result.date) {
          contextString += `   Date: ${result.date}\n`;
        }
        contextString += "\n";
      });

      if (context.answerBox) {
        contextString += `Quick Answer: ${context.answerBox.answer}\n`;
        contextString += `Source: ${context.answerBox.link}\n\n`;
      }

      contextString += "---\n\n";
    }
  });

  return contextString;
}
