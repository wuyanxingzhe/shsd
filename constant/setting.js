// 默认项目任务配置
export const DEFAULT_SETTINGS = {
  textSplitMinLength: 1500,
  textSplitMaxLength: 2000,
  questionGenerationLength: 240,
  questionMaskRemovingProbability: 60,
  huggingfaceToken: '',
  concurrencyLimit: 5,
  visionConcurrencyLimit: 5,
  // 多轮对话数据集默认配置
  multiTurnSystemPrompt: '',
  multiTurnScenario: '',
  multiTurnRounds: 3,
  multiTurnRoleA: '',
  multiTurnRoleB: ''
};
