import { tool } from "ai";
import { z } from "zod";

export const calculatorTool = tool({
  description: "Perform mathematical calculations",
  parameters: z.object({
    expression: z
      .string()
      .describe("The mathematical expression to evaluate, e.g., '2 + 2 * 3'"),
  }),
  execute: async ({ expression }) => {
    try {
      // Safe evaluation using Function constructor with limited scope
      // In production, use a proper math library like mathjs
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");

      // Basic validation
      if (sanitized !== expression.replace(/\s/g, "").replace(/\s/g, "")) {
        return {
          error: "Invalid characters in expression",
          expression,
        };
      }

      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${sanitized}`)();

      return {
        expression,
        result: Number(result),
        formatted: `${expression} = ${result}`,
      };
    } catch {
      return {
        error: "Failed to evaluate expression",
        expression,
      };
    }
  },
});
