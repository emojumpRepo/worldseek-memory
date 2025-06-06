import { FeishuServer, YuqueServer } from '@fastgpt/global/core/dataset/apiDataset';
import {
  DeepRagSearchProps,
  SearchDatasetDataResponse
} from '../../core/dataset/search/controller';
import { AuthOpenApiLimitProps } from '../../support/openapi/auth';
import {
  GetProApiDatasetFileContentParams,
  GetProApiDatasetFileListParams,
  GetProApiDatasetFilePreviewUrlParams
} from '../../core/dataset/apiDataset/proApi';

declare global {
  var textCensorHandler: (params: { text: string }) => Promise<{ code: number; message?: string }>;
  var deepRagHandler: (data: DeepRagSearchProps) => Promise<SearchDatasetDataResponse>;
  var authOpenApiHandler: (data: AuthOpenApiLimitProps) => Promise<any>;

  // API dataset
  var getProApiDatasetFileList: (data: GetProApiDatasetFileListParams) => Promise<APIFileItem[]>;
  var getProApiDatasetFileContent: (
    data: GetProApiDatasetFileContentParams
  ) => Promise<ApiFileReadContentResponse>;
  var getProApiDatasetFilePreviewUrl: (
    data: GetProApiDatasetFilePreviewUrlParams
  ) => Promise<string>;
}
