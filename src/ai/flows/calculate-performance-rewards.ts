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
    .describe('Kết quả thực tế đạt được cho KPI.'),
  target: z.number().describe('Giá trị mục tiêu được đặt cho KPI.'),
  performanceRatingFactors: z
    .string()
    .describe(
      'Các yếu tố ảnh hưởng đến việc xếp hạng hiệu suất (ví dụ: A, B, C, D).'
    ),
});
export type CalculatePerformanceRewardsInput = z.infer<
  typeof CalculatePerformanceRewardsInputSchema
>;

// Define the output schema for the calculatePerformanceRewards function
const CalculatePerformanceRewardsOutputSchema = z.object({
  performanceRating: z
    .string()
    .describe('Xếp hạng hiệu suất đã tính toán (ví dụ: A, B, C, D).'),
  potentialRewards: z
    .string()
    .describe('Mô tả các phần thưởng tiềm năng dựa trên hiệu suất.'),
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
  prompt: `Dựa trên kết quả KPI, mục tiêu và các yếu tố xếp hạng hiệu suất, hãy xác định xếp hạng hiệu suất và các phần thưởng tiềm năng.

Kết quả KPI: {{{kpiResults}}}
Mục tiêu: {{{target}}}
Yếu tố xếp hạng hiệu suất: {{{performanceRatingFactors}}}

Hãy xem xét các tiêu chí sau khi xác định xếp hạng hiệu suất và phần thưởng:
- Nếu Kết quả KPI >= Mục tiêu, xếp hạng hiệu suất là A, và phần thưởng tiềm năng bao gồm thưởng và xem xét thăng chức.
- Nếu Kết quả KPI >= 0.8 * Mục tiêu, xếp hạng hiệu suất là B, và phần thưởng tiềm năng bao gồm thưởng.
- Nếu Kết quả KPI >= 0.6 * Mục tiêu, xếp hạng hiệu suất là C, và phần thưởng tiềm năng bao gồm duy trì vị trí hiện tại.
- Nếu Kết quả KPI < 0.6 * Mục tiêu, xếp hạng hiệu suất là D, và phần thưởng tiềm năng bao gồm kế hoạch cải thiện hiệu suất.

Cung cấp một xếp hạng hiệu suất ngắn gọn (A, B, C, hoặc D) và một mô tả ngắn về các phần thưởng tiềm năng.
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
