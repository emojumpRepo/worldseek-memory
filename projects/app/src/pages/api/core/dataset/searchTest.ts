import type { SearchTestProps, SearchTestResponse } from '@/global/core/dataset/api.d';
import { authDataset } from '@fastgpt/service/support/permission/dataset/auth';
import {
  deepRagSearch,
  defaultSearchDatasetData
} from '@fastgpt/service/core/dataset/search/controller';
import {
  checkTeamAIPoints,
  checkTeamReRankPermission
} from '@fastgpt/service/support/permission/teamLimit';
import { NextAPI } from '@/service/middleware/entry';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { useIPFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { ApiRequestProps } from '@fastgpt/service/type/next';
import { getRerankModel } from '@fastgpt/service/core/ai/model';

async function handler(req: ApiRequestProps<SearchTestProps>): Promise<SearchTestResponse> {
  const {
    datasetId,
    text,
    limit = 1500,
    similarity,
    searchMode,
    embeddingWeight,

    usingReRank,
    rerankModel,
    rerankWeight,

    datasetSearchUsingExtensionQuery = false,
    datasetSearchExtensionModel,
    datasetSearchExtensionBg,

    datasetDeepSearch = false,
    datasetDeepSearchModel,
    datasetDeepSearchMaxTimes,
    datasetDeepSearchBg
  } = req.body;

  if (!datasetId || !text) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  const start = Date.now();

  // auth dataset role
  const { dataset, teamId, tmbId, apikey } = await authDataset({
    req,
    authToken: true,
    authApiKey: true,
    datasetId,
    per: ReadPermissionVal
  });
  // auth balance
  await checkTeamAIPoints(teamId);

  const searchData = {
    histories: [],
    teamId,
    reRankQuery: text,
    queries: [text],
    model: dataset.vectorModel,
    limit: Math.min(limit, 20000),
    similarity,
    datasetIds: [datasetId],
    searchMode,
    embeddingWeight,
    usingReRank: usingReRank && (await checkTeamReRankPermission(teamId)),
    rerankModel: getRerankModel(rerankModel),
    rerankWeight
  };
  const { searchRes, tokens, queryExtensionResult, deepSearchResult, ...result } = datasetDeepSearch
    ? await deepRagSearch({
        ...searchData,
        datasetDeepSearchModel,
        datasetDeepSearchMaxTimes,
        datasetDeepSearchBg
      })
    : await defaultSearchDatasetData({
        ...searchData,
        datasetSearchUsingExtensionQuery,
        datasetSearchExtensionModel,
        datasetSearchExtensionBg
      });

  return {
    list: searchRes,
    duration: `${((Date.now() - start) / 1000).toFixed(3)}s`,
    queryExtensionModel: queryExtensionResult?.model,
    ...result
  };
}

export default NextAPI(useIPFrequencyLimit({ id: 'search-test', seconds: 1, limit: 15 }), handler);
