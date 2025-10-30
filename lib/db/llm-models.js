'use server';
import { db } from '@/lib/db/index';

export async function getLlmModelsByProviderId(providerId) {
  try {
    return await db.llmModels.findMany({ where: { providerId } });
  } catch (error) {
    console.error('Failed to get llmModels by providerId in database');
    throw error;
  }
}

export async function createLlmModels(models) {
  try {
    return await db.llmModels.createMany({ data: models });
  } catch (error) {
    console.error('Failed to create llmModels in database');
    throw error;
  }
}
