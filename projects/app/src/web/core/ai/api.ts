import { GET, POST, PUT, DELETE } from '@/web/common/api/request';

export const postQuestionGuide = (data: any, cancelToken: AbortController) =>
  POST<string[]>('/core/ai/agent/v2/createQuestionGuide', data, { cancelToken });
