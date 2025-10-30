import { NextResponse } from 'next/server';
import { distillQuestionsPrompt } from '@/lib/llm/prompts/distillQuestions';
import { db } from '@/lib/db';

const LLMClient = require('@/lib/llm/core');

/**
 * 生成问题接口：根据某个标签链路构造指定数量的问题
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;

    // 验证项目ID
    if (!projectId) {
      return NextResponse.json({ error: '项目ID不能为空' }, { status: 400 });
    }

    const { tagPath, currentTag, tagId, count = 5, model, language = 'zh' } = await request.json();

    if (!currentTag || !tagPath) {
      const errorMsg = language === 'en' ? 'Tag information cannot be empty' : '标签信息不能为空';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // 首先获取或创建蒸馏文本块
    let distillChunk = await db.chunks.findFirst({
      where: {
        projectId,
        name: 'Distilled Content'
      }
    });

    if (!distillChunk) {
      // 创建一个特殊的蒸馏文本块
      distillChunk = await db.chunks.create({
        data: {
          name: 'Distilled Content',
          projectId,
          fileId: 'distilled',
          fileName: 'distilled.md',
          content:
            'This text block is used to store questions generated through data distillation and is not related to actual literature.',
          summary: 'Questions generated through data distillation',
          size: 0
        }
      });
    }

    // 获取已有的问题，避免重复
    const existingQuestions = await db.questions.findMany({
      where: {
        projectId,
        label: currentTag,
        chunkId: distillChunk.id // 使用蒸馏文本块的 ID
      },
      select: { question: true }
    });

    const existingQuestionTexts = existingQuestions.map(q => q.question);

    const llmClient = new LLMClient(model);
    const prompt = await distillQuestionsPrompt(
      language,
      { tagPath, currentTag, count, existingQuestionTexts },
      projectId
    );
    const { answer } = await llmClient.getResponseWithCOT(prompt);

    let questions = [];
    try {
      questions = JSON.parse(answer);
    } catch (error) {
      console.error('解析问题JSON失败:', String(error));
      // 尝试使用正则表达式提取问题
      const matches = answer.match(/"([^"]+)"/g);
      if (matches) {
        questions = matches.map(match => match.replace(/"/g, ''));
      }
    }

    // 保存问题到数据库
    const savedQuestions = [];
    for (const questionText of questions) {
      const question = await db.questions.create({
        data: {
          question: questionText,
          projectId,
          label: currentTag,
          chunkId: distillChunk.id
        }
      });
      savedQuestions.push(question);
    }

    return NextResponse.json(savedQuestions);
  } catch (error) {
    console.error('生成问题失败:', String(error));
    return NextResponse.json({ error: error.message || '生成问题失败' }, { status: 500 });
  }
}
