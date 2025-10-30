import { getQuestionById, updateQuestion } from '@/lib/db/questions';
import { createDataset, updateDataset } from '@/lib/db/datasets';
import { getAnswerPrompt } from '@/lib/llm/prompts/answer';
import { getEnhancedAnswerPrompt } from '@/lib/llm/prompts/enhancedAnswer';
import { getOptimizeCotPrompt } from '@/lib/llm/prompts/optimizeCot';
import { getChunkById } from '@/lib/db/chunks';
import { getActiveGaPairsByFileId } from '@/lib/db/ga-pairs';
import { nanoid } from 'nanoid';
import LLMClient from '@/lib/llm/core/index';
import logger from '@/lib/util/logger';

/**
 * 优化思维链
 * @param {string} originalQuestion - 原始问题
 * @param {string} answer - 答案
 * @param {string} originalCot - 原始思维链
 * @param {string} language - 语言
 * @param {object} llmClient - LLM客户端
 * @param {string} id - 数据集ID
 * @param {string} projectId - 项目ID
 */
async function optimizeCot(originalQuestion, answer, originalCot, language, llmClient, id, projectId) {
  try {
    const prompt = await getOptimizeCotPrompt(language, { originalQuestion, answer, originalCot }, projectId);
    const { answer: as, cot } = await llmClient.getResponseWithCOT(prompt);
    const optimizedAnswer = as || cot;
    const result = await updateDataset({ id, cot: optimizedAnswer.replace('优化后的思维链', '') });
    logger.info(`成功优化思维链: ${originalQuestion}, ID: ${id}`);
    return result;
  } catch (error) {
    logger.error(`优化思维链失败: ${error.message}`);
    throw error;
  }
}

/**
 * 为单个问题生成答案并创建数据集
 * @param {string} projectId - 项目ID
 * @param {string} questionId - 问题ID
 * @param {object} options - 选项
 * @param {string} options.model - 模型名称
 * @param {string} options.language - 语言(中文/en)
 * @returns {Promise<Object>} 生成的数据集
 */
export async function generateDatasetForQuestion(projectId, questionId, options) {
  try {
    const { model, language = '中文' } = options;

    // 验证参数
    if (!projectId || !questionId || !model) {
      throw new Error('缺少必要参数');
    }

    // 获取问题
    const question = await getQuestionById(questionId);
    if (!question) {
      throw new Error('问题不存在');
    }

    // 获取文本块内容
    const chunk = await getChunkById(question.chunkId);
    if (!chunk) {
      throw new Error('文本块不存在');
    }
    const idDistill = chunk.name === 'Distilled Content';

    const llmClient = new LLMClient(model);
    let activeGaPairs = [];
    let questionLinkedGaPair = null;
    let useEnhancedPrompt = false;

    if (chunk.fileId && !idDistill) {
      try {
        activeGaPairs = await getActiveGaPairsByFileId(chunk.fileId);
        if (question.gaPairId) {
          questionLinkedGaPair = activeGaPairs.find(ga => ga.id === question.gaPairId);
          if (questionLinkedGaPair) {
            useEnhancedPrompt = true;
            logger.info(`问题关联GA pair: ${questionLinkedGaPair.genreTitle}+${questionLinkedGaPair.audienceTitle}`);
          }
        }

        logger.info(`检查到激活的GA对，${useEnhancedPrompt ? '使用' : '不使用'}增强提示词`);
      } catch (error) {
        logger.warn(`获取GA pairs失败，使用标准提示词: ${error.message}`);
        useEnhancedPrompt = false;
      }
    }

    let prompt;

    if (idDistill) {
      // 对于蒸馏内容，直接使用问题
      prompt = question.question;
    } else if (useEnhancedPrompt) {
      // 使用MGA增强提示词
      const primaryGaPair = {
        genre: `${questionLinkedGaPair.genreTitle}: ${questionLinkedGaPair.genreDesc}`,
        audience: `${questionLinkedGaPair.audienceTitle}: ${questionLinkedGaPair.audienceDesc}`,
        active: questionLinkedGaPair.isActive
      };
      logger.info(`使用问题关联的GA pair: ${primaryGaPair.genre} | ${primaryGaPair.audience}`);

      prompt = await getEnhancedAnswerPrompt(
        language,
        {
          text: chunk.content,
          question: question.question,
          activeGaPair: primaryGaPair
        },
        projectId
      );

      logger.info(`使用MGA增强提示词生成答案`);
    } else {
      // 使用标准提示词
      prompt = await getAnswerPrompt(
        language,
        {
          text: chunk.content,
          question: question.question
        },
        projectId
      );

      logger.info('使用标准提示词生成答案');
    }

    // 调用大模型生成答案
    const { answer, cot } = await llmClient.getResponseWithCOT(prompt);

    const datasetId = nanoid(12);

    // 创建新的数据集项
    const datasets = {
      id: datasetId,
      projectId: projectId,
      question: question.question,
      answer: answer,
      model: model.modelName,
      cot: cot,
      questionLabel: question.label || null
    };

    let chunkData = await getChunkById(question.chunkId);
    datasets.chunkName = chunkData.name;
    datasets.chunkContent = ''; // 不再保存原始文本块内容
    datasets.questionId = question.id;

    let dataset = await createDataset(datasets);
    if (cot && !idDistill) {
      // 为了性能考虑，这里异步优化
      optimizeCot(question.question, answer, cot, language, llmClient, datasetId, projectId);
    }
    if (dataset) {
      await updateQuestion({ id: questionId, answered: true });
    }

    const logMessage = useEnhancedPrompt
      ? `成功生成MGA增强数据集: ${question.question}`
      : `成功生成标准数据集: ${question.question}`;
    logger.info(logMessage);

    return {
      success: true,
      dataset,
      mgaEnhanced: useEnhancedPrompt,
      activePairs: activeGaPairs.length
    };
  } catch (error) {
    logger.error(`生成数据集失败: ${error.message}`);
    throw error;
  }
}

export default {
  generateDatasetForQuestion,
  optimizeCot
};
