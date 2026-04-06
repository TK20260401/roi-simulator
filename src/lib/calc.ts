export type SimInputs = {
  operatorCost: number;       // オペレーター人材コスト（万円/月）
  personMonthCost: number;    // 人月コスト（万円/人月）
  monthlyCalls: number;       // 月間コール件数
  avgCallTime: number;        // 1コール平均時間（分）
  systemCost: number;         // 現行システム運用費（万円/月）
  trainingCost: number;       // 新人教育費用（万円/年）
  otherCost: number;          // その他費用（万円/月）
  initialInvestment: number;  // 初期費用（万円）
  monthlyAiCost: number;     // AI月額費用（万円/月）
  automationRate: number;     // AI自動化率（%）
  headcountReduction: number; // 人員削減見込み（人）
  trainingReductionRate: number; // 教育コスト削減率（%）
};

export type SimResults = {
  currentMonthlyCost: number;     // 現状月間コスト（万円）
  afterMonthlyCost: number;       // 導入後月間コスト（万円）
  monthlySaving: number;          // 月間コスト削減額（万円）
  annualSaving: number;           // 年間効果額（万円）
  roi: number;                    // ROI（%）
  paybackMonths: number;          // 投資回収期間（月）
  reductionRate: number;          // コスト削減率（%）
};

export function calculate(input: SimInputs): SimResults {
  const {
    operatorCost, personMonthCost, systemCost, trainingCost, otherCost,
    initialInvestment, monthlyAiCost, automationRate, headcountReduction, trainingReductionRate,
  } = input;

  // 現状月間コスト
  const currentMonthlyCost = operatorCost + systemCost + (trainingCost / 12) + otherCost;

  // 導入後月間コスト
  const reducedOperatorCost = Math.max(0, operatorCost - (headcountReduction * personMonthCost));
  const reducedTrainingCost = (trainingCost * (1 - trainingReductionRate / 100)) / 12;
  const afterMonthlyCost = reducedOperatorCost + monthlyAiCost + reducedTrainingCost + otherCost;

  // 月間削減額
  const monthlySaving = Math.max(0, currentMonthlyCost - afterMonthlyCost);

  // 年間効果額
  const annualSaving = monthlySaving * 12;

  // 年間AI費用
  const annualAiCost = monthlyAiCost * 12;

  // ROI (%)
  const totalInvestment = initialInvestment + annualAiCost;
  const roi = totalInvestment > 0 ? ((annualSaving - annualAiCost) / totalInvestment) * 100 : 0;

  // 投資回収期間（月）
  const paybackMonths = monthlySaving > 0 ? initialInvestment / monthlySaving : Infinity;

  // コスト削減率
  const reductionRate = currentMonthlyCost > 0 ? (monthlySaving / currentMonthlyCost) * 100 : 0;

  return {
    currentMonthlyCost: Math.round(currentMonthlyCost * 10) / 10,
    afterMonthlyCost: Math.round(afterMonthlyCost * 10) / 10,
    monthlySaving: Math.round(monthlySaving * 10) / 10,
    annualSaving: Math.round(annualSaving * 10) / 10,
    roi: Math.round(roi * 10) / 10,
    paybackMonths: paybackMonths === Infinity ? 999 : Math.round(paybackMonths * 10) / 10,
    reductionRate: Math.round(reductionRate * 10) / 10,
  };
}

// 月次累積データ生成（折れ線グラフ用）
export function generateMonthlyData(input: SimInputs, results: SimResults, months: number = 24) {
  const data = [];
  for (let m = 0; m <= months; m++) {
    const cumulativeInvestment = input.initialInvestment + input.monthlyAiCost * m;
    const cumulativeSaving = results.monthlySaving * m;
    data.push({
      month: m,
      label: `${m}月`,
      cumulativeInvestment: Math.round(cumulativeInvestment),
      cumulativeSaving: Math.round(cumulativeSaving),
    });
  }
  return data;
}

// コスト比較データ生成（棒グラフ用）
export function generateCostComparison(input: SimInputs, results: SimResults) {
  const reducedOperator = Math.max(0, input.operatorCost - (input.headcountReduction * input.personMonthCost));
  const reducedTraining = Math.round((input.trainingCost * (1 - input.trainingReductionRate / 100)) / 12);
  return [
    { name: "人件費", before: input.operatorCost, after: reducedOperator },
    { name: "システム", before: input.systemCost, after: input.monthlyAiCost },
    { name: "教育費", before: Math.round(input.trainingCost / 12), after: reducedTraining },
    { name: "その他", before: input.otherCost, after: input.otherCost },
  ];
}
