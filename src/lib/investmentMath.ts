const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const getTotalRoiAmount = (amountUsd: number, roiPercent: number) =>
  roundCurrency((Number(amountUsd) * Number(roiPercent)) / 100);

export const getDailyEarning = (
  amountUsd: number,
  roiPercent: number,
  durationDays: number
) => {
  const safeDurationDays = Math.max(1, Number(durationDays) || 1);
  return roundCurrency(getTotalRoiAmount(amountUsd, roiPercent) / safeDurationDays);
};

export const getDailyRoiPercent = (roiPercent: number, durationDays: number) => {
  const safeDurationDays = Math.max(1, Number(durationDays) || 1);
  return roundCurrency(Number(roiPercent) / safeDurationDays);
};

export const getElapsedInvestmentDays = (
  startDate: string | null | undefined,
  durationDays: number,
  now = new Date()
) => {
  if (!startDate) return 0;

  const parsedStartDate = new Date(startDate);
  if (Number.isNaN(parsedStartDate.getTime())) return 0;

  const elapsedDays = Math.floor((now.getTime() - parsedStartDate.getTime()) / MS_PER_DAY);
  return Math.max(0, Math.min(Number(durationDays) || 0, elapsedDays));
};

export const getRemainingInvestmentDays = (
  startDate: string | null | undefined,
  durationDays: number,
  now = new Date()
) => Math.max(0, (Number(durationDays) || 0) - getElapsedInvestmentDays(startDate, durationDays, now));

export const getExpectedEarnedAmount = (
  amountUsd: number,
  roiPercent: number,
  durationDays: number,
  elapsedDays: number
) => {
  const safeDurationDays = Math.max(1, Number(durationDays) || 1);
  const cappedElapsedDays = Math.max(0, Math.min(safeDurationDays, Number(elapsedDays) || 0));
  const totalRoiAmount = getTotalRoiAmount(amountUsd, roiPercent);

  return roundCurrency((totalRoiAmount * cappedElapsedDays) / safeDurationDays);
};
