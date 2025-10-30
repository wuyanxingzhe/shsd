import { processPrompt } from '../common/prompt-loader';

export const QUESTION_PROMPT = `
# Role: 文本问题生成专家
## Profile:
- Description: 你是一名专业的文本分析与问题设计专家，能够从复杂文本中提炼关键信息并产出可用于模型微调的高质量问题集合。
- Input Length: {{textLength}} 字
- Output Goal: 生成不少于 {{number}} 个高质量问题，用于构建问答训练数据集。

## Skills:
1. 能够全面理解原文内容，识别核心概念、事实与逻辑结构。
2. 擅长设计具有明确答案指向性的问题，覆盖文本多个侧面。
3. 善于控制问题难度与类型，保证多样性与代表性。
4. 严格遵守格式规范，确保输出可直接用于程序化处理。

## Workflow:
1. **文本解析**：通读全文，分段识别关键实体、事件、数值与结论。
2. **问题设计**：基于信息密度和重要性选择最佳提问切入点{{gaPromptNote}}。
3. **质量检查**：逐条校验问题，确保：
   - 问题答案可在原文中直接找到依据。
   - 问题之间主题不重复、角度不雷同。
   - 语言表述准确、无歧义且符合常规问句形式。
   {{gaPromptCheck}}

## Constraints:
1. 所有问题必须严格依据原文内容，不得添加外部信息或假设情境。
2. 问题需覆盖文本的不同主题、层级或视角，避免集中于单一片段。
3. 禁止输出与材料元信息相关的问题（如作者、章节、目录等）。
4. 问题不得包含“报告/文章/文献/表格中提到”等表述，需自然流畅。
5. 输出不少于 {{number}} 个问题，且保持格式一致。

## Output Format:
- 使用合法的 JSON 数组，仅包含字符串元素。
- 字段必须使用英文双引号。
- 严格遵循以下结构：
\`\`\`
["问题1", "问题2", "..."]
\`\`\`

## Output Example:
\`\`\`
["人工智能伦理框架应包含哪些核心要素？", "民法典对个人数据保护有哪些新规定？"]
\`\`\`

## Text to Analyze:
{{text}}

## GA Instruction (Optional):
{{gaPrompt}}
`;

export const QUESTION_PROMPT_EN = `
# Role: Text Question Generation Expert
## Profile:
- Description: You are an expert in text analysis and question design, capable of extracting key information from complex passages and producing high-quality questions for fine-tuning datasets.
- Input Length: {{textLength}} characters
- Output Goal: Generate at least {{number}} high-quality questions suitable for training data.

## Skills:
1. Comprehend the source text thoroughly and identify core concepts, facts, and logical structures.
2. Design questions with clear answer orientation that cover multiple aspects of the text.
3. Balance difficulty and variety to ensure representative coverage of the content.
4. Enforce strict formatting so the output can be consumed programmatically.

## Workflow:
1. **Text Parsing**: Read the entire passage, segment it, and capture key entities, events, metrics, and conclusions.
2. **Question Design**: Select the most informative focal points to craft questions{{gaPromptNote}}.
3. **Quality Check**: Validate each question to ensure:
   - The answer can be located directly in the original text.
   - Questions do not duplicate topics or angles.
   - Wording is precise, unambiguous, and uses natural interrogative phrasing.
   {{gaPromptCheck}}

## Constraints:
1. Every question must be grounded strictly in the provided text; no external information or hypothetical scenarios.
2. Cover diverse themes, layers, or perspectives from the passage; avoid clustering around one segment.
3. Do not include questions about meta information (author, chapters, table of contents, etc.).
4. Avoid phrases such as "in the report/article/literature/table"; questions must read naturally.
5. Produce at least {{number}} questions with consistent formatting.

## Output Format:
- Return a valid JSON array containing only strings.
- Use double quotes for all strings.
- Follow this exact structure:
\`\`\`
["Question 1", "Question 2", "..."]
\`\`\`

## Output Example:
\`\`\`
["What core elements should an AI ethics framework include?", "What new regulations does the Civil Code have for personal data protection?"]
\`\`\`

## Text to Analyze:
{{text}}

## GA Instruction (Optional):
{{gaPrompt}}
`;

export const GA_QUESTION_PROMPT = `
**目标体裁**: {{genre}}
**目标受众**: {{audience}}

请确保：
1. 问题应完全符合「{{genre}}」所定义的风格、焦点和深度等等属性。
2. 问题应考虑到「{{audience}}」的知识水平、认知特点和潜在兴趣点。
3. 从该受众群体的视角和需求出发提出问题
4. 保持问题的针对性和实用性，确保问题-答案的风格一致性
5. 问题应具有一定的清晰度和具体性，避免过于宽泛或模糊。
`;

export const GA_QUESTION_PROMPT_EN = `
## Special Requirements - Genre & Audience Perspective Questioning:
Adjust your questioning approach and question style based on the following genre and audience combination:

**Target Genre**: {{genre}}
**Target Audience**: {{audience}}

Please ensure:
1. The question should fully conform to the style, focus, depth, and other attributes defined by "{{genre}}".
2. The question should consider the knowledge level, cognitive characteristics, and potential points of interest of "{{audience}}".
3. Propose questions from the perspective and needs of this audience group.
4. Maintain the specificity and practicality of the questions, ensuring consistency in the style of questions and answers.
5. The question should have a certain degree of clarity and specificity, avoiding being too broad or vague.
`;

/**
 * 构建 GA 提示词
 * @param {string} language - 语言，'en' 或 '中文'
 * @param {Object} activeGaPair - 当前激活的 GA 组合
 * @returns {String} 构建的 GA 提示词
 */
export function getGAPrompt(language, { activeGaPair }) {
  if (!activeGaPair || !activeGaPair.active) {
    return '';
  }
  const prompt = language === 'en' ? GA_QUESTION_PROMPT_EN : GA_QUESTION_PROMPT;
  return prompt.replaceAll('{{genre}}', activeGaPair.genre).replaceAll('{{audience}}', activeGaPair.audience);
}

/**
 * 生成问题提示词生成提示模板。
 * @param {string} language - 语言，'en' 或 '中文'
 * @param {Object} params - 参数对象
 * @param {string} params.text - 待处理的文本
 * @param {number} params.number - 问题数量
 * @param {Object} params.activeGaPair - 当前激活的 GA对
 * @returns {string} - 完整的提示词
 */
export async function getQuestionPrompt(
  language,
  { text, number = Math.floor(text.length / 240), activeGaPair = null },
  projectId = null
) {
  // 构建GA pairs相关的提示词
  const gaPromptText = getGAPrompt(language, { activeGaPair });
  const gaPromptNote = gaPromptText
    ? language === 'en'
      ? ', and incorporate the specified genre-audience perspective'
      : '，并结合指定的体裁受众视角'
    : '';
  const gaPromptCheck = gaPromptText
    ? language === 'en'
      ? '- Question style matches the specified genre and audience'
      : '- 问题风格与指定的体裁受众匹配'
    : '';
  const result = await processPrompt(
    language,
    'question',
    'QUESTION_PROMPT',
    { zh: QUESTION_PROMPT, en: QUESTION_PROMPT_EN },
    {
      textLength: text.length,
      number,
      gaPrompt: gaPromptText,
      gaPromptNote,
      gaPromptCheck,
      text
    },
    projectId
  );
  return result;
}

export default getQuestionPrompt;
