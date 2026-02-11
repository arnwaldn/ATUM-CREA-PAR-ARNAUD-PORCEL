import { weatherTool } from "./weather";
import { searchTool } from "./search";
import { calculatorTool } from "./calculator";

export const tools = {
  getWeather: weatherTool,
  search: searchTool,
  calculate: calculatorTool,
};
