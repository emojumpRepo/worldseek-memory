import { UsageSourceEnum } from '@fastgpt/global/support/wallet/usage/constants';
import { MongoUsage } from './schema';
import { ClientSession } from '../../../common/mongo';
import { addLog } from '../../../common/system/log';
import { ConcatUsageProps, CreateUsageProps } from '@fastgpt/global/support/wallet/usage/api';
import { i18nT } from '../../../../web/i18n/utils';

export async function createUsage(data: CreateUsageProps) {
  return;
}
export async function concatUsage(data: ConcatUsageProps) {
  return;
}

export const createChatUsage = () => {
  return { totalPoints: 0 };
};

export const createTrainingUsage = async () => {
  return { billId: 'free' };
};

export const createPdfParseUsage = async () => {
  return;
};
