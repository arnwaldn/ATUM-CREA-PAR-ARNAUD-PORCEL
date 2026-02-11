import { tool } from "ai";
import { z } from "zod";

export const searchTool = tool({
  description: "Search the web for information",
  parameters: z.object({
    query: z.string().describe("The search query"),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe("Maximum number of results"),
  }),
  execute: async ({ query, limit }) => {
    // In production, use a real search API (e.g., Exa, Tavily)
    // This is a mock implementation
    const mockResults = [
      {
        title: `Result 1 for "${query}"`,
        url: "https://example.com/1",
        snippet: `This is a relevant result for your search about ${query}.`,
      },
      {
        title: `Result 2 for "${query}"`,
        url: "https://example.com/2",
        snippet: `Another informative page about ${query}.`,
      },
    ].slice(0, limit);

    return {
      query,
      results: mockResults,
      totalResults: mockResults.length,
    };
  },
});
