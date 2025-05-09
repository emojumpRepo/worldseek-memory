import {
  StandardSubLevelEnum,
  SubModeEnum,
  SubTypeEnum,
  standardSubLevelMap
} from '@fastgpt/global/support/wallet/sub/constants';
import { MongoTeamSub } from './schema';
import { FeTeamPlanStatusType, TeamSubSchema } from '@fastgpt/global/support/wallet/sub/type.d';
import { getVectorCountByTeamId } from '../../../common/vectorStore/controller';
import dayjs from 'dayjs';
import { ClientSession } from '../../../common/mongo';
import { addMonths } from 'date-fns';
import { readFromSecondary } from '../../../common/mongo/utils';

export const getStandardPlansConfig = () => {
  return global?.subPlans?.standard;
};
export const getStandardPlanConfig = (level: `${StandardSubLevelEnum}`) => {
  return global.subPlans?.standard?.[level];
};

export const sortStandPlans = (plans: TeamSubSchema[]) => {
  return plans.sort(
    (a, b) =>
      standardSubLevelMap[b.currentSubLevel].weight - standardSubLevelMap[a.currentSubLevel].weight
  );
};
export const getTeamStandPlan = async ({ teamId }: { teamId: string }) => {
  const plans = await MongoTeamSub.find(
    {
      teamId,
      type: SubTypeEnum.standard
    },
    undefined,
    {
      ...readFromSecondary
    }
  );
  sortStandPlans(plans);

  const standardPlans = global.subPlans?.standard;
  const standard = plans[0];

  return {
    [SubTypeEnum.standard]: standard,
    standardConstants:
      standard?.currentSubLevel && standardPlans
        ? standardPlans[standard.currentSubLevel]
        : undefined
  };
};

export const initTeamFreePlan = async ({
  teamId,
  session
}: {
  teamId: string;
  session?: ClientSession;
}) => {
  return MongoTeamSub.create(
    [
      {
        teamId,
        type: SubTypeEnum.standard,
        currentMode: SubModeEnum.month,
        nextMode: SubModeEnum.month,
        startTime: new Date(),
        expiredTime: new Date('2099-12-31'),
        currentSubLevel: StandardSubLevelEnum.enterprise,
        nextSubLevel: StandardSubLevelEnum.enterprise,
        totalPoints: 999999999,
        surplusPoints: 999999999
      }
    ],
    { session, ordered: true }
  );
};

export const getTeamPlanStatus = async ({
  teamId
}: {
  teamId: string;
}): Promise<FeTeamPlanStatusType> => {
  const standardPlans = global.subPlans?.standard;

  /* Get all plans and datasetSize */
  const [plans, usedDatasetSize] = await Promise.all([
    MongoTeamSub.find({ teamId }).lean(),
    getVectorCountByTeamId(teamId)
  ]);

  /* Get all standardPlans and active standardPlan */
  const teamStandardPlans = sortStandPlans(
    plans.filter((plan) => plan.type === SubTypeEnum.standard)
  );
  const standardPlan = teamStandardPlans[0];

  const extraDatasetSize = plans.filter((plan) => plan.type === SubTypeEnum.extraDatasetSize);
  const extraPoints = plans.filter((plan) => plan.type === SubTypeEnum.extraPoints);

  // Free user, first login after expiration. The free subscription plan will be reset
  if (
    (standardPlan &&
      standardPlan.expiredTime &&
      standardPlan.currentSubLevel === StandardSubLevelEnum.free &&
      dayjs(standardPlan.expiredTime).isBefore(new Date())) ||
    teamStandardPlans.length === 0
  ) {
    console.log('Init free stand plan', { teamId });
    await initTeamFreePlan({ teamId });
    return getTeamPlanStatus({ teamId });
  }

  const totalPoints = standardPlans
    ? (standardPlan?.totalPoints || 0) +
      extraPoints.reduce((acc, cur) => acc + (cur.totalPoints || 0), 0)
    : Infinity;
  const surplusPoints =
    (standardPlan?.surplusPoints || 0) +
    extraPoints.reduce((acc, cur) => acc + (cur.surplusPoints || 0), 0);

  const standardMaxDatasetSize =
    standardPlan?.currentSubLevel && standardPlans
      ? standardPlans[standardPlan.currentSubLevel]?.maxDatasetSize || Infinity
      : Infinity;
  const totalDatasetSize =
    standardMaxDatasetSize +
    extraDatasetSize.reduce((acc, cur) => acc + (cur.currentExtraDatasetSize || 0), 0);

  return {
    [SubTypeEnum.standard]: standardPlan,
    standardConstants:
      standardPlan?.currentSubLevel && standardPlans
        ? standardPlans[standardPlan.currentSubLevel]
        : undefined,

    totalPoints,
    usedPoints: totalPoints - surplusPoints,

    datasetMaxSize: totalDatasetSize,
    usedDatasetSize
  };
};
