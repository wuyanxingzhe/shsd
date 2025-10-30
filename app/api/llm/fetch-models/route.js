import { NextResponse } from 'next/server';
import axios from 'axios';

// 从模型提供商获取模型列表
export async function POST(request) {
  try {
    const { endpoint, providerId, apiKey } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: '缺少 endpoint 参数' }, { status: 400 });
    }

    let url = endpoint.replace(/\/$/, ''); // 去除末尾的斜杠

    // 处理 Ollama endpoint
    if (providerId === 'ollama') {
      // 移除可能存在的 /v1 或其他版本前缀
      url = url.replace(/\/v\d+$/, '');

      // 如果 endpoint 不包含 /api，则添加
      if (!url.includes('/api')) {
        url += '/api';
      }
      url += '/tags';
    } else {
      url += '/models';
    }

    const headers = {};
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await axios.get(url, { headers });

    // 根据不同提供商格式化返回数据
    let formattedModels = [];
    if (providerId === 'ollama') {
      // Ollama /api/tags 返回的格式: { models: [{ name: 'model-name', ... }] }
      if (response.data.models && Array.isArray(response.data.models)) {
        formattedModels = response.data.models.map(item => ({
          modelId: item.name,
          modelName: item.name,
          providerId
        }));
      }
    } else {
      // 默认处理方式（適用于 OpenAI 等）
      if (response.data.data && Array.isArray(response.data.data)) {
        formattedModels = response.data.data.map(item => ({
          modelId: item.id,
          modelName: item.id,
          providerId
        }));
      }
    }

    return NextResponse.json(formattedModels);
  } catch (error) {
    console.error('获取模型列表失败:', String(error));

    // 处理特定错误
    if (error.response) {
      if (error.response.status === 401) {
        return NextResponse.json({ error: 'API Key 无效' }, { status: 401 });
      }
      return NextResponse.json(
        { error: `获取模型列表失败: ${error.response.statusText}` },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: `获取模型列表失败: ${error.message}` }, { status: 500 });
  }
}
