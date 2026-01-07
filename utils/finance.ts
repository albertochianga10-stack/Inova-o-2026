
import { FinancialData, Indicators, PayrollResult, Employee } from '../types';

export const calculateIndicators = (data: FinancialData): Indicators => {
  const {
    ativoCirculante,
    estoques,
    disponibilidades,
    passivoCirculante,
    passivoNaoCirculante,
    ativoNaoCirculante,
    patrimonioLiquido,
    receitaLiquida,
    lucroBruto,
    lucroOperacional,
    lucroLiquido
  } = data;

  const ativoTotal = (ativoCirculante || 0) + (ativoNaoCirculante || 0);

  return {
    liquidezCorrente: (ativoCirculante || 0) / (passivoCirculante || 1),
    liquidezSeca: ((ativoCirculante || 0) - (estoques || 0)) / (passivoCirculante || 1),
    liquidezImediata: (disponibilidades || 0) / (passivoCirculante || 1),
    endividamentoTotal: ((passivoCirculante || 0) + (passivoNaoCirculante || 0)) / (ativoTotal || 1),
    margemBruta: (lucroBruto || 0) / (receitaLiquida || 1),
    margemOperacional: (lucroOperacional || 0) / (receitaLiquida || 1),
    margemLiquida: (lucroLiquido || 0) / (receitaLiquida || 1),
    roi: (lucroLiquido || 0) / (ativoTotal || 1),
    roe: (lucroLiquido || 0) / (patrimonioLiquido || 1),
    giroAtivos: (receitaLiquida || 0) / (ativoTotal || 1)
  };
};

/**
 * Cálculos Fiscais de Angola (2024)
 * INSS: 3% Trabalhador, 8% Empresa
 * IRT: Tabela Progressiva (Isenção até 100.000 Kz)
 */
export const calculatePayroll = (emp: Employee): PayrollResult => {
  const taxableBase = emp.baseSalary + emp.bonus; // Subsídios de alimentação/transporte costumam ter isenção até certo limite
  const inssWorker = taxableBase * 0.03;
  const inssEmployer = taxableBase * 0.08;
  
  const baseForIRT = taxableBase - inssWorker;
  let irt = 0;

  // Tabela IRT Angola Simplificada (Brackets Progressivos)
  if (baseForIRT <= 100000) {
    irt = 0;
  } else if (baseForIRT <= 150000) {
    irt = (baseForIRT - 100000) * 0.10;
  } else if (baseForIRT <= 200000) {
    irt = 5000 + (baseForIRT - 150000) * 0.125;
  } else if (baseForIRT <= 300000) {
    irt = 11250 + (baseForIRT - 200000) * 0.15;
  } else if (baseForIRT <= 500000) {
    irt = 26250 + (baseForIRT - 300000) * 0.19;
  } else {
    irt = 64250 + (baseForIRT - 500000) * 0.25;
  }

  const grossSalary = emp.baseSalary + emp.allowances + emp.bonus;
  const netSalary = grossSalary - inssWorker - irt;

  return {
    employeeId: emp.id,
    grossSalary,
    inssWorker,
    irt,
    netSalary,
    inssEmployer,
    totalCost: grossSalary + inssEmployer
  };
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-AO', { 
    style: 'currency', 
    currency: 'AOA',
    minimumFractionDigits: 2
  }).format(val).replace('AOA', 'Kz');
};

export const formatPercent = (val: number) => {
  return (val * 100).toFixed(2) + '%';
};

export const getStatusColor = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s.includes('otimista') || s.includes('bom')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (s.includes('alerta') || s.includes('risco')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (s.includes('neutro')) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};
