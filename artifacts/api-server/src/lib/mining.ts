// Mining constants
export const GEMS_PER_100_USDT = 10_000_000; // 10M gems for $100 over 6 months
export const MINING_PERIOD_DAYS = 180; // 6 months
export const DAILY_GEMS_PER_100_USDT = GEMS_PER_100_USDT / MINING_PERIOD_DAYS; // ~55,555 per day

// Conversion constants
export const GEMS_PER_ETR_NORMAL = 100_000; // 10M gems = 100 ETR => 100,000 gems per ETR
export const GEMS_PER_ETR_DYNAMIC = 200_000; // After 1M ETR swapped: 200,000 gems per ETR
export const ETR_DYNAMIC_THRESHOLD = 1_000_000; // 1M ETR total swapped triggers rate change
export const ETR_PER_USDT = 100 / 350; // 100 ETR = $350 => 1 ETR = $3.50
export const ETR_TOTAL_SUPPLY = 21_000_000;
export const ETR_USER_ALLOCATION = ETR_TOTAL_SUPPLY * 0.6; // 60% for users

/**
 * Calculate gems accrued since last claim (or mining start)
 */
export function calculatePendingGems(
  totalDepositUsdt: number,
  miningStartedAt: Date,
  lastClaimedAt: Date | null
): number {
  if (totalDepositUsdt <= 0) return 0;

  const now = new Date();
  const fromDate = lastClaimedAt || miningStartedAt;
  const hoursElapsed = (now.getTime() - fromDate.getTime()) / (1000 * 60 * 60);
  const daysElapsed = hoursElapsed / 24;

  // Max out at the 180-day period from mining start
  const totalDaysSinceStart = (now.getTime() - miningStartedAt.getTime()) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.max(0, MINING_PERIOD_DAYS - totalDaysSinceStart);
  const effectiveDays = Math.min(daysElapsed, daysLeft);

  const dailyRate = (totalDepositUsdt / 100) * DAILY_GEMS_PER_100_USDT;
  return effectiveDays * dailyRate;
}

/**
 * Get current conversion rate (gems per ETR)
 */
export function getConversionRate(totalEtrSwapped: number): number {
  return totalEtrSwapped >= ETR_DYNAMIC_THRESHOLD
    ? GEMS_PER_ETR_DYNAMIC
    : GEMS_PER_ETR_NORMAL;
}

/**
 * Calculate ETR from gems
 */
export function gemsToEtr(gems: number, totalEtrSwapped: number): number {
  const rate = getConversionRate(totalEtrSwapped);
  return gems / rate;
}

/**
 * Calculate USDT from gems (via ETR price)
 */
export function gemsToUsdt(gems: number, totalEtrSwapped: number): number {
  const etr = gemsToEtr(gems, totalEtrSwapped);
  return etr * 3.5; // 1 ETR = $3.50
}
