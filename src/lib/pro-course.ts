export type ProModule = {
  id: number;
  title: string;
  summary: string;
};
export const PRO_MODULES: ProModule[] = [
  {id:1,title:"Reading Charts Across Timeframes",summary:"Compare closing-price views, chart zones, uncertainties and missing OHLC information."},
  {id:2,title:"Evidence, News and Scenario Planning",summary:"Verify claims, distinguish data from predictions and frame multiple evidence-based scenarios."},
  {id:3,title:"Position Sizing, Costs and Gap Risk",summary:"Apply fictional cash-share sizing, fees, drawdowns and gap-loss arithmetic."},
  {id:4,title:"Paper-Trading Lab and Decision Journal",summary:"Record hypothetical fills, no-fills, no-action choices and assumptions honestly."},
  {id:5,title:"Three Case Studies and Competing Explanations",summary:"Analyse close-only trends, retrospective false breakouts and gross versus net results."},
  {id:6,title:"Discipline, Review and Investor Safety",summary:"Review simulated records, recognize misleading guarantees and protect credentials."},
];
export const PRO_RESOURCES=[
  {id:"handbook",title:"Pro Handbook",filename:"Earnwale-Pro-Handbook.pdf"},
  {id:"workbook",title:"Pro Workbook",filename:"Earnwale-Pro-Workbook.pdf"},
  {id:"journal",title:"Paper Practice Journal",filename:"Earnwale-Pro-Journal.pdf"},
  {id:"cases",title:"Case Study Cards",filename:"Earnwale-Pro-Cases.pdf"},
  {id:"practice",title:"Sample Practice Questions",filename:"Earnwale-Pro-Practice.pdf"},
] as const;
export const PRO_VIDEO_COUNT=PRO_MODULES.length;
export const PRO_QUIZ_BANK_SIZE=36;
export function hasProAccess(plan:unknown):boolean{
  return String(plan ?? "").trim() === "500";
}
