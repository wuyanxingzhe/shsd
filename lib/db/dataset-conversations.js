/**
 * 多轮对话数据集数据库操作
 */

import { db } from '@/lib/db/index';

/**
 * 创建多轮对话数据集
 * @param {object} data - 对话数据集数据
 * @returns {Promise<object>} 创建的对话数据集
 */
export async function createDatasetConversation(data) {
  return await db.datasetConversations.create({
    data
  });
}

/**
 * 根据ID获取多轮对话数据集
 * @param {string} id - 对话数据集ID
 * @returns {Promise<object|null>} 对话数据集或null
 */
export async function getDatasetConversationById(id) {
  return await db.datasetConversations.findUnique({
    where: { id },
    include: {
      project: true
    }
  });
}

/**
 * 分页获取多轮对话数据集列表
 * @param {string} projectId - 项目ID
 * @param {number} page - 页码
 * @param {number} pageSize - 页大小
 * @param {object} filters - 筛选条件
 * @returns {Promise<object>} 分页数据
 */
export async function getDatasetConversationsByPagination(projectId, page = 1, pageSize = 20, filters = {}) {
  const skip = (page - 1) * pageSize;
  const where = { projectId };

  // 关键字筛选
  if (filters.keyword) {
    where.OR = [
      { question: { contains: filters.keyword } },
      { tags: { contains: filters.keyword } },
      { note: { contains: filters.keyword } }
    ];
  }

  // 角色设定筛选
  if (filters.roleA) {
    where.roleA = { contains: filters.roleA };
  }
  if (filters.roleB) {
    where.roleB = { contains: filters.roleB };
  }

  // 对话场景筛选
  if (filters.scenario) {
    where.scenario = { contains: filters.scenario };
  }

  // 评分筛选
  if (filters.scoreMin !== undefined) {
    where.score = { ...where.score, gte: parseFloat(filters.scoreMin) };
  }
  if (filters.scoreMax !== undefined) {
    where.score = { ...where.score, lte: parseFloat(filters.scoreMax) };
  }

  // 确认状态筛选
  if (filters.confirmed !== undefined) {
    where.confirmed = filters.confirmed === 'true';
  }

  const [data, total] = await Promise.all([
    db.datasetConversations.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createAt: 'desc' },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    }),
    db.datasetConversations.count({ where })
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * 更新多轮对话数据集
 * @param {string} id - 对话数据集ID
 * @param {object} data - 更新数据
 * @returns {Promise<object>} 更新后的对话数据集
 */
export async function updateDatasetConversation(id, data) {
  return await db.datasetConversations.update({
    where: { id },
    data: {
      ...data,
      updateAt: new Date()
    }
  });
}

/**
 * 删除多轮对话数据集
 * @param {string} id - 对话数据集ID
 * @returns {Promise<object>} 删除的对话数据集
 */
export async function deleteDatasetConversation(id) {
  return await db.datasetConversations.delete({
    where: { id }
  });
}

/**
 * 获取项目的多轮对话数据集统计信息
 * @param {string} projectId - 项目ID
 * @returns {Promise<object>} 统计信息
 */
export async function getDatasetConversationStats(projectId) {
  const [total, confirmed, avgScore] = await Promise.all([
    db.datasetConversations.count({
      where: { projectId }
    }),
    db.datasetConversations.count({
      where: { projectId, confirmed: true }
    }),
    db.datasetConversations.aggregate({
      where: { projectId, score: { gt: 0 } },
      _avg: { score: true }
    })
  ]);

  return {
    total,
    confirmed,
    unconfirmed: total - confirmed,
    avgScore: avgScore._avg.score || 0
  };
}

/**
 * 获取所有多轮对话数据集（用于导出）
 * @param {string} projectId - 项目ID
 * @param {object} filters - 筛选条件
 * @returns {Promise<Array>} 对话数据集列表
 */
export async function getAllDatasetConversations(projectId, filters = {}) {
  const where = { projectId };

  // 应用筛选条件
  if (filters.confirmed !== undefined) {
    where.confirmed = filters.confirmed;
  }

  if (filters.keyword) {
    where.OR = [
      { question: { contains: filters.keyword } },
      { tags: { contains: filters.keyword } },
      { note: { contains: filters.keyword } }
    ];
  }

  return await db.datasetConversations.findMany({
    where,
    orderBy: { createAt: 'desc' }
  });
}

/**
 * 根据问题ID查找相关的多轮对话数据集
 * @param {string} questionId - 问题ID
 * @returns {Promise<Array>} 相关的对话数据集
 */
export async function getDatasetConversationsByQuestionId(questionId) {
  return await db.datasetConversations.findMany({
    where: { questionId },
    orderBy: { createAt: 'desc' }
  });
}

/**
 * 获取多轮对话的导航项（上一个/下一个对话）
 * @param {string} projectId - 项目ID
 * @param {string} conversationId - 当前对话ID
 * @param {string} operateType - 操作类型 ('prev' | 'next')
 * @returns {Promise<object|null>} 导航项或null
 */
export async function getConversationNavigationItems(projectId, conversationId, operateType) {
  const currentItem = await db.datasetConversations.findUnique({
    where: { id: conversationId }
  });

  if (!currentItem) {
    throw new Error('Current conversation does not exist');
  }

  if (operateType === 'prev') {
    return await db.datasetConversations.findFirst({
      where: {
        createAt: { gt: currentItem.createAt },
        projectId
      },
      orderBy: { createAt: 'asc' }
    });
  } else {
    return await db.datasetConversations.findFirst({
      where: {
        createAt: { lt: currentItem.createAt },
        projectId
      },
      orderBy: { createAt: 'desc' }
    });
  }
}
