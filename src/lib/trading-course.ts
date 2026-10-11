export type CourseModule = { id: number; title: string; duration: string; seconds: number; summary: string };
export const COURSE_MODULES: CourseModule[] = [
  { id: 1, title: "Introduction to Financial Markets", duration: "6:48", seconds: 408, summary: "Market participants, securities, ownership and foundational risk." },
  { id: 2, title: "How Stock Markets Work", duration: "7:21", seconds: 441, summary: "Exchanges, brokers, orders, trading and settlement." },
  { id: 3, title: "Understanding Candlestick Charts", duration: "7:25", seconds: 445, summary: "Open, high, low, close, candles and their limitations." },
  { id: 4, title: "Support, Resistance and Trends", duration: "8:23", seconds: 503, summary: "Chart zones, trend direction and false breakouts." },
  { id: 5, title: "Risk Management and Position Sizing", duration: "7:32", seconds: 452, summary: "Illustrative risk calculations, gaps and uncertainty." },
  { id: 6, title: "Trading Psychology and Common Mistakes", duration: "7:15", seconds: 435, summary: "FOMO, revenge trading, learning journals and reflection." },
];
export const COURSE_VIDEO_COUNT = 6;
export const COURSE_TOTAL_SECONDS = COURSE_MODULES.reduce((total, module) => total + module.seconds, 0);
export const ACCESS_PLANS = new Set(["300", "500"]);
export function hasTradingAccess(plan: unknown): boolean {
  return ACCESS_PLANS.has(String(plan ?? "").trim());
}
