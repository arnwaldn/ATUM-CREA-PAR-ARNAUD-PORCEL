import { tool } from "ai";
import { z } from "zod";

export const weatherTool = tool({
  description: "Get the current weather for a location",
  parameters: z.object({
    location: z.string().describe("The city and country, e.g., Paris, France"),
    unit: z
      .enum(["celsius", "fahrenheit"])
      .optional()
      .default("celsius")
      .describe("Temperature unit"),
  }),
  execute: async ({ location, unit }) => {
    // In production, call a real weather API
    // This is a mock implementation
    const mockWeather = {
      location,
      temperature: unit === "celsius" ? 22 : 72,
      unit,
      condition: "Partly Cloudy",
      humidity: 65,
      wind: "12 km/h",
    };

    return mockWeather;
  },
});
