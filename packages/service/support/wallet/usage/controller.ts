export async function createUsage() {
  return;
}
export async function concatUsage() {
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
