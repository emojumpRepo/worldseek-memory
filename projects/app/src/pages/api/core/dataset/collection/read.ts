import type { ApiRequestProps } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authDatasetCollection } from '@fastgpt/service/support/permission/dataset/auth';
import { DatasetCollectionTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { createFileToken } from '@fastgpt/service/support/permission/controller';
import { BucketNameEnum, ReadFileBaseUrl } from '@fastgpt/global/common/file/constants';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';
import { OutLinkChatAuthProps } from '@fastgpt/global/support/permission/chat';
import { DatasetErrEnum } from '@fastgpt/global/common/error/code/dataset';
import { getCollectionWithDataset } from '@fastgpt/service/core/dataset/controller';
import { useApiDatasetRequest } from '@fastgpt/service/core/dataset/apiDataset/api';

export type readCollectionSourceQuery = {};

export type readCollectionSourceBody = {
  collectionId: string;
} & OutLinkChatAuthProps;

export type readCollectionSourceResponse = {
  type: 'url';
  value: string;
};

async function handler(
  req: ApiRequestProps<readCollectionSourceBody, readCollectionSourceQuery>
): Promise<readCollectionSourceResponse> {
  const { collectionId } = req.body;

  const {
    collection,
    teamId: userTeamId,
    tmbId: uid,
    authType
  } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId: req.body.collectionId,
    per: ReadPermissionVal
  });

  const sourceUrl = await (async () => {
    if (collection.type === DatasetCollectionTypeEnum.file && collection.fileId) {
      const token = await createFileToken({
        bucketName: BucketNameEnum.dataset,
        teamId: userTeamId,
        uid,
        fileId: collection.fileId,
        customExpireMinutes: authType === 'outLink' ? 5 : undefined
      });

      return `${ReadFileBaseUrl}/${collection.name}?token=${token}`;
    }
    if (collection.type === DatasetCollectionTypeEnum.link && collection.rawLink) {
      return collection.rawLink;
    }
    if (collection.type === DatasetCollectionTypeEnum.apiFile && collection.apiFileId) {
      const apiServer = collection.dataset.apiServer;
      const feishuServer = collection.dataset.feishuServer;
      const yuqueServer = collection.dataset.yuqueServer;

      if (apiServer) {
        return useApiDatasetRequest({ apiServer }).getFilePreviewUrl({
          apiFileId: collection.apiFileId
        });
      }

      if (feishuServer || yuqueServer) {
        return global.getProApiDatasetFilePreviewUrl({
          apiFileId: collection.apiFileId,
          feishuServer,
          yuqueServer
        });
      }

      return '';
    }
    if (collection.type === DatasetCollectionTypeEnum.externalFile) {
      if (collection.externalFileId && collection.dataset.externalReadUrl) {
        return collection.dataset.externalReadUrl.replace('{{fileId}}', collection.externalFileId);
      }
      if (collection.externalFileUrl) {
        return collection.externalFileUrl;
      }
    }

    return '';
  })();

  return {
    type: 'url',
    value: sourceUrl
  };
}

export default NextAPI(handler);
