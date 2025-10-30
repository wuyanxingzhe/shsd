/**
 * 数据集评估任务处理器
 * 处理批量数据集质量评估的异步任务
 */

import { updateTask } from './index';
import { getDatasetsByPagination } from '@/lib/db/datasets';
import { batchEvaluateDatasets } from '@/lib/services/datasets/evaluation';
import { TASK } from '@/constant';

/**
 * 处理数据集评估任务
 * @param {object} task - 任务对象
 */
export async function processDatasetEvaluationTask(task) {
  const { id: taskId, projectId, modelInfo, language } = task;

  try {
    console.log(`开始处理数据集评估任务: ${taskId}`);

    // 更新任务状态为处理中
    await updateTask(taskId, {
      status: TASK.STATUS.PROCESSING,
      startTime: new Date().toISOString()
    });

    // 解析模型信息
    const model = typeof modelInfo === 'string' ? JSON.parse(modelInfo) : modelInfo;

    if (!model || !model.modelName) {
      throw new Error('模型配置不完整');
    }

    // 1. 查找所有未评估的数据集（score为0或null的数据集）
    console.log(`查找项目 ${projectId} 中未评估的数据集...`);

    const unevaluatedDatasets = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await getDatasetsByPagination(projectId, page, pageSize, {
        // 不传递任何筛选条件，获取所有数据集
      });

      if (response.data && response.data.length > 0) {
        // 在内存中筛选未评估的数据集
        const unscored = response.data.filter(
          dataset => !dataset.score || dataset.score === 0 || !dataset.aiEvaluation
        );
        unevaluatedDatasets.push(...unscored);

        page++;
        hasMore = response.data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`找到 ${unevaluatedDatasets.length} 个未评估的数据集`);

    if (unevaluatedDatasets.length === 0) {
      await updateTask(taskId, {
        status: TASK.STATUS.COMPLETED,
        endTime: new Date().toISOString(),
        completedCount: 0,
        totalCount: 0,
        note: '没有找到需要评估的数据集'
      });
      return;
    }

    // 更新任务总数
    await updateTask(taskId, {
      totalCount: unevaluatedDatasets.length
    });

    // 2. 批量评估数据集
    const datasetIds = unevaluatedDatasets.map(dataset => dataset.id);

    let completedCount = 0;
    const progressCallback = async (current, total) => {
      completedCount = current;
      await updateTask(taskId, {
        completedCount: current,
        note: `正在评估数据集: ${current}/${total}`
      });
    };

    const evaluationResults = await batchEvaluateDatasets(projectId, datasetIds, model, language, progressCallback);

    // 3. 更新任务完成状态
    const endTime = new Date().toISOString();
    const note = `评估完成: 成功 ${evaluationResults.success} 个，失败 ${evaluationResults.failed} 个`;

    await updateTask(taskId, {
      status: TASK.STATUS.COMPLETED,
      endTime,
      completedCount: unevaluatedDatasets.length,
      note,
      detail: JSON.stringify({
        successCount: evaluationResults.success,
        failedCount: evaluationResults.failed,
        results: evaluationResults.results.slice(0, 10) // 只保存前10个结果作为详情
      })
    });

    console.log(`数据集评估任务完成: ${taskId}, ${note}`);
  } catch (error) {
    console.error(`数据集评估任务失败: ${taskId}`, error);

    // 更新任务为失败状态
    await updateTask(taskId, {
      status: TASK.STATUS.FAILED,
      endTime: new Date().toISOString(),
      note: `评估失败: ${error.message}`
    });

    throw error;
  }
}
