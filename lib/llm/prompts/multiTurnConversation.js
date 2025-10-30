import { processPrompt } from '../common/prompt-loader';

// 生成助手回复的提示词
export const ASSISTANT_REPLY_PROMPT = `
# Role: 多轮对话助手角色
## Profile:
- Description: 你是一名专业的对话伙伴，扮演指定的助手角色，基于参考资料进行多轮对话交流。
- Goal: 基于参考资料，生成符合角色设定的专业回复，保持对话的连贯性和逻辑性。

## Skills:
1. 深度理解参考资料，准确提取关键信息
2. 完全融入指定的角色设定，保持角色一致性
3. 根据对话历史，生成逻辑连贯的回复
4. 确保回复内容与参考资料相关

## 对话场景设定:
{{scenario}}

## 角色设定:
- {{roleA}}: 提问者，寻求信息和帮助
- {{roleB}}: 回答者（你的角色），提供专业、详细的回答

## 参考资料:
{{chunkContent}}

## 对话历史:
{{conversationHistory}}

## 当前状态:
这是第 {{currentRound}} 轮对话（总共 {{totalRounds}} 轮）

## Workflow:
1. 仔细阅读参考资料，理解核心信息
2. 回顾对话历史，理解当前对话的发展脉络
3. 基于{{roleB}}的角色设定，生成专业回复
4. 优先使用参考资料中的信息，如果参考资料无法完全回答问题，可以结合自己的专业知识进行补充

## Constraints:
1. 优先基于参考资料回答，参考资料是主要信息来源
2. 当参考资料中找不到相应信息时，可以根据自己的专业知识提供有价值的回答
3. 必须保持{{roleB}}角色的一致性和专业性
4. 回复要与对话历史保持逻辑连贯性
5. 回复内容要详细但不冗长，适中的长度
6. 给出的回复内容中不要包含参考资料 XXXX，这样的字符，要保证回复内容自然合理
7. 当使用自己的知识时，要确保信息准确可靠，符合角色专业水准
8.不要在回答中出现："由于没有直接相关的案例资料"、"参考资料中未提及这样的字眼"，直接生成自然的回复

## Output Format:
严格按照以下JSON格式输出，确保格式正确：
\`\`\`json
{
  "content": "{{roleB}}的具体回复内容"
}
\`\`\`

注意：
1. 必须返回有效的JSON格式
2. 只包含content字段
3. content字段的值就是{{roleB}}的完整回复
4. 不要包含任何额外的标识符或格式标记
`;

export const ASSISTANT_REPLY_PROMPT_EN = `
# Role: Multi-turn Conversation Assistant
## Profile:
- Description: You are a professional conversation partner, playing the specified assistant role, engaging in multi-turn conversations based on original text content.
- Goal: Generate professional replies that match the role setting based on original text content, maintaining conversation coherence and logic.

## Skills:
1. Deeply understand original text content and accurately extract key information
2. Fully embody the specified role setting and maintain role consistency
3. Generate logically coherent replies based on conversation history
4. Ensure reply content is highly relevant to the original text

## Conversation Scenario:
{{scenario}}

## Role Settings:
- {{roleA}}: Questioner, seeking information and help
- {{roleB}}: Responder (your role), providing professional and detailed answers

## Original Text Content:
{{chunkContent}}

## Conversation History:
{{conversationHistory}}

## Current Status:
This is round {{currentRound}} of conversation (total {{totalRounds}} rounds)

## Workflow:
1. Carefully read the original text content and understand the core information
2. Review conversation history and understand the current conversation development
3. Generate professional replies based on the {{roleB}} role setting
4. Prioritize information from original text content, but if the original text cannot fully answer the question, supplement with your own professional knowledge

## Constraints:
1. Prioritize answers based on original text content, which is the primary information source
2. When relevant information cannot be found in the original text, provide valuable answers based on your own professional knowledge
3. Must maintain consistency and professionalism of the {{roleB}} role
4. Replies must maintain logical coherence with conversation history
5. Reply content should be detailed but not verbose, with appropriate length
6. When using your own knowledge, ensure the information is accurate and reliable, meeting the professional standards of the role
7. If it's the last round of conversation, appropriate summarization is allowed

## Output Format:
Strictly follow the JSON format below, ensure correct formatting:
\`\`\`json
{
  "content": "Specific reply content for {{roleB}}"
}
\`\`\`

Note:
1. Must return valid JSON format
2. Only include the content field
3. The content field value is the complete reply for {{roleB}}
4. Do not include any additional identifiers or format markers
`;

// 生成下一轮用户问题的提示词
export const NEXT_QUESTION_PROMPT = `
# Role: 多轮对话用户角色
## Profile:
- Description: 你是一名专业的对话参与者，扮演指定的用户角色，基于已有对话历史生成下一轮的自然问题。
- Goal: 基于对话历史和参考资料，生成符合角色设定的后续问题，推进对话深入发展。

## Skills:
1. 分析对话历史，识别对话发展脉络和未涵盖的话题
2. 完全融入指定的用户角色设定
3. 生成自然流畅、逻辑连贯的后续问题
4. 确保问题与参考资料相关

## 对话场景设定:
{{scenario}}

## 角色设定:
- {{roleA}}: 提问者（你的角色），基于已有对话继续深入询问
- {{roleB}}: 回答者，提供专业回答

## 参考资料:
{{chunkContent}}

## 对话历史:
{{conversationHistory}}

## 当前状态:
即将开始第 {{nextRound}} 轮对话（总共 {{totalRounds}} 轮）

## Workflow:
1. 回顾完整的对话历史，理解已讨论的内容
2. 基于参考资料，识别尚未深入探讨的方面
3. 从{{roleA}}的角色视角，提出自然的后续问题
4. 确保问题推进对话向更深层次发展

## Constraints:
1. 问题必须与参考资料相关，不得脱离主题
2. 必须保持{{roleA}}角色的语言风格和询问方式
3. 问题要基于对话历史，体现自然的对话发展
4. 避免重复之前已经问过的问题
5. 问题类型可以是：澄清细节、扩展讨论、实际应用、相关问题等
6. 问题要简洁明确，避免过于复杂或宽泛

## Output Format:
严格按照以下JSON格式输出，确保格式正确：
\`\`\`json
{
  "question": "{{roleA}}的具体问题内容"
}
\`\`\`

注意：
1. 必须返回有效的JSON格式
2. 只包含question字段
3. question字段的值就是{{roleA}}的完整问题
4. 不要包含任何额外的标识符或格式标记
`;

export const NEXT_QUESTION_PROMPT_EN = `
# Role: Multi-turn Conversation User
## Profile:
- Description: You are a professional conversation participant, playing the specified user role, generating natural follow-up questions based on existing conversation history.
- Goal: Generate follow-up questions that match the role setting based on conversation history and original text content, advancing the conversation development.

## Skills:
1. Analyze conversation history and identify conversation development and uncovered topics
2. Fully embody the specified user role setting
3. Generate natural, fluent, and logically coherent follow-up questions
4. Ensure questions are related to original text content

## Conversation Scenario:
{{scenario}}

## Role Settings:
- {{roleA}}: Questioner (your role), continuing to ask in-depth questions based on existing conversation
- {{roleB}}: Responder, providing professional answers

## Original Text Content:
{{chunkContent}}

## Conversation History:
{{conversationHistory}}

## Current Status:
About to start round {{nextRound}} of conversation (total {{totalRounds}} rounds)

## Workflow:
1. Review the complete conversation history and understand the discussed content
2. Based on original text content, identify aspects that haven't been deeply explored
3. From {{roleA}}'s role perspective, ask natural follow-up questions
4. Ensure questions advance the conversation to deeper levels

## Constraints:
1. Questions must be related to original text content, not deviating from the topic
2. Must maintain {{roleA}} role's language style and questioning approach
3. Questions should be based on conversation history, reflecting natural conversation development
4. Avoid repeating previously asked questions
5. Question types can be: clarifying details, expanding discussion, practical application, related questions, etc.
6. Questions should be concise and clear, avoiding excessive complexity or broadness

## Output Format:
Strictly follow the JSON format below, ensure correct formatting:
\`\`\`json
{
  "question": "Specific question content for {{roleA}}"
}
\`\`\`

Note:
1. Must return valid JSON format
2. Only include the question field
3. The question field value is the complete question for {{roleA}}
4. Do not include any additional identifiers or format markers
`;

/**
 * 生成助手回复的提示词
 * @param {string} language - 语言，'en' 或 '中文'
 * @param {Object} params - 参数对象
 * @param {string} params.scenario - 对话场景
 * @param {string} params.roleA - 角色A设定
 * @param {string} params.roleB - 角色B设定
 * @param {string} params.chunkContent - 参考资料
 * @param {string} params.conversationHistory - 对话历史
 * @param {number} params.currentRound - 当前轮数
 * @param {number} params.totalRounds - 总轮数
 * @param {string} projectId - 项目ID
 * @returns {string} - 完整的提示词
 */
export async function getAssistantReplyPrompt(
  language,
  { scenario, roleA, roleB, chunkContent, conversationHistory, currentRound, totalRounds },
  projectId = null
) {
  let chunck = '';
  if (
    chunkContent.includes('This text block is used to store questions generated through data distillation') ||
    !chunkContent
  ) {
    if (language === 'en') {
      chunck = 'No reference materials available. Please generate a reply based on your own knowledge.';
    } else {
      chunck = '没有可用的参考资料，请根据自己的知识直接生成回复';
    }
  }
  const result = await processPrompt(
    language,
    'multiTurnConversation',
    'ASSISTANT_REPLY_PROMPT',
    { zh: ASSISTANT_REPLY_PROMPT, en: ASSISTANT_REPLY_PROMPT_EN },
    {
      scenario,
      roleA,
      roleB,
      chunkContent: chunck,
      conversationHistory,
      currentRound,
      totalRounds
    },
    projectId
  );
  return result;
}

/**
 * 生成下一轮用户问题的提示词
 * @param {string} language - 语言，'en' 或 '中文'
 * @param {Object} params - 参数对象
 * @param {string} params.scenario - 对话场景
 * @param {string} params.roleA - 角色A设定
 * @param {string} params.roleB - 角色B设定
 * @param {string} params.chunkContent - 参考资料
 * @param {string} params.conversationHistory - 对话历史
 * @param {number} params.nextRound - 下一轮数
 * @param {number} params.totalRounds - 总轮数
 * @param {string} projectId - 项目ID
 * @returns {string} - 完整的提示词
 */
export async function getNextQuestionPrompt(
  language,
  { scenario, roleA, roleB, chunkContent, conversationHistory, nextRound, totalRounds },
  projectId = null
) {
  let chunck = '';
  if (
    chunkContent.includes('This text block is used to store questions generated through data distillation') ||
    !chunkContent
  ) {
    if (language === 'en') {
      chunck = 'No reference materials available. Please generate a reply based on your own knowledge.';
    } else {
      chunck = '没有可用的参考资料，请根据自己的知识直接生成回复';
    }
  }
  const result = await processPrompt(
    language,
    'multiTurnConversation',
    'NEXT_QUESTION_PROMPT',
    { zh: NEXT_QUESTION_PROMPT, en: NEXT_QUESTION_PROMPT_EN },
    {
      scenario,
      roleA,
      roleB,
      chunkContent: chunck,
      conversationHistory,
      nextRound,
      totalRounds
    },
    projectId
  );
  return result;
}

export default {
  getAssistantReplyPrompt,
  getNextQuestionPrompt
};
