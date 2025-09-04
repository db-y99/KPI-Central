'use server';

/**
 * @fileOverview This file defines a Genkit flow for calculating performance rewards or ratings based on KPI results.
 *
 * It includes:
 * - `calculatePerformanceRewards`: An async function that takes KPI data and returns a performance evaluation.
 * - `CalculatePerformanceRewardsInput`: The input type for the function, defining the structure of KPI data.
 * - `CalculatePerformanceRewardsOutput`: The output type, providing performance rating and potential rewards.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the calculatePerformanceRewards function
const CalculatePerformanceRewardsInputSchema = z.object({
  kpiResults: z
    .number()
    .describe('The actual results achieved for the KPI.'),
  target: z.number().describe('The target value set for the KPI.'),
  performanceRatingFactors: z
    .string()
    .describe(
      'Factors influencing performance rating (e.g., A, B, C, D).'
    ),
});
export type CalculatePerformanceRewardsInput = z.infer<
  typeof CalculatePerformanceRewardsInputSchema
>;

// Define the output schema for the calculatePerformanceRewards function
const CalculatePerformanceRewardsOutputSchema = z.object({
  performanceRating: z
    .string()
    .describe('The calculated performance rating (e.g., A, B, C, D).'),
  potentialRewards: z
    .string()
    .describe('A description of potential rewards based on performance.'),
});
export type CalculatePerformanceRewardsOutput = z.infer<
  typeof CalculatePerformanceRewardsOutputSchema
>;

// Define the calculatePerformanceRewards function
export async function calculatePerformanceRewards(
  input: CalculatePerformanceRewardsInput
): Promise<CalculatePerformanceRewardsOutput> {
  return calculatePerformanceRewardsFlow(input);
}

// Define the prompt for calculating performance rewards
const calculatePerformanceRewardsPrompt = ai.definePrompt({
  name: 'calculatePerformanceRewardsPrompt',
  input: {schema: CalculatePerformanceRewardsInputSchema},
  output: {schema: CalculatePerformanceRewardsOutputSchema},
  prompt: `Based on the KPI results, target, and performance rating factors, determine the performance rating and potential rewards.

KPI Results: {{{kpiResults}}}
Target: {{{target}}}
Performance Rating Factors: {{{performanceRatingFactors}}}

Consider the following criteria when determining performance rating and rewards:
- If KPI Results >= Target, the performance rating is A, and potential rewards include a bonus and promotion consideration.
- If KPI Results >= 0.8 * Target, the performance rating is B, and potential rewards include a bonus.
- If KPI Results >= 0.6 * Target, the performance rating is C, and potential rewards include maintaining the current position.
- If KPI Results < 0.6 * Target, the performance rating is D, and potential rewards include performance improvement plan.

Provide a concise performance rating (A, B, C, or D) and a brief description of potential rewards.
`,
});

// Define the Genkit flow for calculating performance rewards
const calculatePerformanceRewardsFlow = ai.defineFlow(
  {
    name: 'calculatePerformanceRewardsFlow',
    inputSchema: CalculatePerformanceRewardsInputSchema,
    outputSchema: CalculatePerformanceRewardsOutputSchema,
  },
  async input => {
    const {output} = await calculatePerformanceRewardsPrompt(input);
    return output!;
  }
);
