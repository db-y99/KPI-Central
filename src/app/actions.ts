'use server';

import {
  calculatePerformanceRewards,
  type CalculatePerformanceRewardsInput,
  type CalculatePerformanceRewardsOutput,
} from '@/ai/flows/calculate-performance-rewards';

export async function calculatePerformanceRewardAction(
  input: CalculatePerformanceRewardsInput
): Promise<CalculatePerformanceRewardsOutput | null> {
  try {
    const result = await calculatePerformanceRewards(input);
    return result;
  } catch (error) {
    console.error('Error in GenAI flow:', error);
    // In a production app, you might want to throw a more specific error
    // or return a structured error object.
    return null;
  }
}
