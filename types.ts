
export interface FinancialData {
  period: string;
  ativoCirculante: number;
  ativoNaoCirculante: number;
  estoques: number;
  disponibilidades: number;
  passivoCirculante: number;
  passivoNaoCirculante: number;
  patrimonioLiquido: number;
  receitaLiquida: number;
  lucroBruto: number;
  lucroOperacional: number;
  lucroLiquido: number;
  vendas: number;
  custos: number;
  // Novos campos de receita por sector
  receitaServicos: number;
  receitaTransportes: number;
  receitaPropinas: number;
  receitaFolhasProva: number;
  receitaUniformes: number;
}

export interface Employee {
  id: string;
  name: string;
  baseSalary: number;
  allowances: number;
  bonus: number;
}

export interface PayrollResult {
  employeeId: string;
  grossSalary: number;
  inssWorker: number;
  irt: number;
  netSalary: number;
  inssEmployer: number;
  totalCost: number;
}

export interface Indicators {
  liquidezCorrente: number;
  liquidezSeca: number;
  liquidezImediata: number;
  endividamentoTotal: number;
  margemBruta: number;
  margemOperacional: number;
  margemLiquida: number;
  roi: number;
  roe: number;
  giroAtivos: number;
}

export interface AnalysisSection {
  title: string;
  status: 'Otimista' | 'Neutro' | 'Alerta';
  description: string;
  recommendations: string[];
}

export interface AIAnalysisResponse {
  shortTerm: AnalysisSection;
  midTerm: AnalysisSection;
  longTerm: AnalysisSection;
  generalSummary: string;
}
