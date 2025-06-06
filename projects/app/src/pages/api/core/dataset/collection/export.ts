import { NextAPI } from '@/service/middleware/entry';
import { DatasetErrEnum } from '@fastgpt/global/common/error/code/dataset';
import { OutLinkChatAuthProps } from '@fastgpt/global/support/permission/chat';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';
import { useIPFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { readFromSecondary } from '@fastgpt/service/common/mongo/utils';
import { responseWriteController } from '@fastgpt/service/common/response';
import { addLog } from '@fastgpt/service/common/system/log';
import { getCollectionWithDataset } from '@fastgpt/service/core/dataset/controller';
import { MongoDatasetData } from '@fastgpt/service/core/dataset/data/schema';
import { authDatasetCollection } from '@fastgpt/service/support/permission/dataset/auth';
import { ApiRequestProps } from '@fastgpt/service/type/next';
import { NextApiResponse } from 'next';

export type ExportCollectionBody = {
  collectionId: string;
  chatTime?: Date;
} & OutLinkChatAuthProps;

async function handler(req: ApiRequestProps<ExportCollectionBody, {}>, res: NextApiResponse) {
  const { collectionId, chatTime } = req.body;

  const { collection, teamId: userTeamId } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId: req.body.collectionId,
    per: ReadPermissionVal
  });

  const where = {
    teamId: userTeamId,
    datasetId: collection.datasetId,
    collectionId,
    ...(chatTime
      ? {
          $or: [
            { updateTime: { $lt: new Date(chatTime) } },
            { history: { $elemMatch: { updateTime: { $lt: new Date(chatTime) } } } }
          ]
        }
      : {})
  };

  res.setHeader('Content-Type', 'text/csv; charset=utf-8;');
  res.setHeader('Content-Disposition', 'attachment; filename=data.csv; ');

  const cursor = MongoDatasetData.find(where, 'q a', {
    ...readFromSecondary,
    batchSize: 1000
  })
    .sort({ chunkIndex: 1 })
    .limit(50000)
    .cursor();

  const write = responseWriteController({
    res,
    readStream: cursor
  });

  write(`\uFEFFindex,content`);

  cursor.on('data', (doc: { q: string; a: string }) => {
    const q = doc.q.replace(/"/g, '""') || '';
    const a = doc.a.replace(/"/g, '""') || '';

    write(`\n"${q}","${a}"`);
  });

  cursor.on('end', () => {
    cursor.close();
    res.end();
  });

  cursor.on('error', (err: Error) => {
    addLog.error(`export usage error`, err);
    res.status(500);
    res.end();
  });
}

export default NextAPI(
  useIPFrequencyLimit({ id: 'export-usage', seconds: 60, limit: 1, force: true }),
  handler
);
