'use server';
import { db } from '@/lib/db/index';
import { nanoid } from 'nanoid';

export async function getModelConfigByProjectId(projectId) {
  try {
    return await db.modelConfig.findMany({ where: { projectId } });
  } catch (error) {
    console.error('Failed to get modelConfig by projectId in database');
    throw error;
  }
}

export async function createInitModelConfig(data) {
  try {
    return await db.modelConfig.createManyAndReturn({ data });
  } catch (error) {
    console.error('Failed to create init modelConfig list in database');
    throw error;
  }
}

export async function getModelConfigById(id) {
  try {
    return await db.modelConfig.findUnique({ where: { id } });
  } catch (error) {
    console.error('Failed to get modelConfig by id in database');
    throw error;
  }
}

export async function deleteModelConfigById(id) {
  try {
    return await db.modelConfig.delete({ where: { id } });
  } catch (error) {
    console.error('Failed to delete modelConfig by id in database');
    throw error;
  }
}

export async function saveModelConfig(models) {
  try {
    if (!models.id) {
      models.id = nanoid(12);
    }
    return await db.modelConfig.upsert({ create: models, update: models, where: { id: models.id } });
  } catch (error) {
    console.error('Failed to create modelConfig in database');
    throw error;
  }
}
