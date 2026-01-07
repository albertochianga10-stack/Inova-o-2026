
import React from 'react';

export const BENCHMARKS = {
  liquidezCorrente: 1.5,
  margemLiquida: 0.1,
  roe: 0.15,
  endividamentoTotal: 0.5,
};

export const INDICATOR_INFO = {
  liquidezCorrente: {
    label: "Liquidez Corrente",
    description: "Indica a capacidade de honrar dívidas de curto prazo usando ativos circulantes.",
    good: "Acima de 1.5",
    bad: "Abaixo de 1.0"
  },
  liquidezSeca: {
    label: "Liquidez Seca",
    description: "Capacidade de pagamento imediato sem depender da venda de estoques.",
    good: "Acima de 1.2",
    bad: "Abaixo de 0.8"
  },
  endividamentoTotal: {
    label: "Endividamento Total",
    description: "Nível de dependência de capital externo face ao ativo total.",
    good: "Abaixo de 50%",
    bad: "Acima de 70%"
  },
  margemLiquida: {
    label: "Margem Líquida",
    description: "Percentagem de lucro que sobra após todas as deduções e impostos AGT.",
    good: "Acima de 10%",
    bad: "Abaixo de 3%"
  },
  roe: {
    label: "ROE (Retorno sobre Patrimônio)",
    description: "Rendimento do capital próprio investido pelos sócios ou investidores.",
    good: "Acima de 15%",
    bad: "Abaixo de 5%"
  }
};

export const MOCK_FINANCIAL_HISTORY: any[] = [
  {
    period: "2024-03-31",
    ativoCirculante: 50000000,
    estoques: 15000000,
    disponibilidades: 8000000,
    passivoCirculante: 32000000,
    ativoNaoCirculante: 80000000,
    passivoNaoCirculante: 40000000,
    patrimonioLiquido: 58000000,
    receitaLiquida: 120000000,
    lucroLiquido: 12000000,
    lucroBruto: 40000000,
    lucroOperacional: 20000000,
    receitaServicos: 40000000,
    receitaTransportes: 20000000,
    receitaPropinas: 45000000,
    receitaFolhasProva: 5000000,
    receitaUniformes: 10000000
  },
  {
    period: "2024-06-30",
    ativoCirculante: 55000000,
    estoques: 16000000,
    disponibilidades: 12000000,
    passivoCirculante: 31000000,
    ativoNaoCirculante: 81000000,
    passivoNaoCirculante: 38000000,
    patrimonioLiquido: 67000000,
    receitaLiquida: 145000000,
    lucroLiquido: 16000000,
    lucroBruto: 48000000,
    lucroOperacional: 25000000,
    receitaServicos: 45000000,
    receitaTransportes: 22000000,
    receitaPropinas: 60000000,
    receitaFolhasProva: 6000000,
    receitaUniformes: 12000000
  },
  {
    period: "2024-09-30",
    ativoCirculante: 62000000,
    estoques: 14000000,
    disponibilidades: 18000000,
    passivoCirculante: 30000000,
    ativoNaoCirculante: 82000000,
    passivoNaoCirculante: 35000000,
    patrimonioLiquido: 79000000,
    receitaLiquida: 170000000,
    lucroLiquido: 22000000,
    lucroBruto: 55000000,
    lucroOperacional: 32000000,
    receitaServicos: 50000000,
    receitaTransportes: 25000000,
    receitaPropinas: 75000000,
    receitaFolhasProva: 8000000,
    receitaUniformes: 12000000
  },
  {
    period: "2024-12-31",
    ativoCirculante: 70000000,
    estoques: 18000000,
    disponibilidades: 25000000,
    passivoCirculante: 35000000,
    ativoNaoCirculante: 85000000,
    passivoNaoCirculante: 32000000,
    patrimonioLiquido: 88000000,
    receitaLiquida: 210000000,
    lucroLiquido: 28000000,
    lucroBruto: 70000000,
    lucroOperacional: 40000000,
    receitaServicos: 60000000,
    receitaTransportes: 30000000,
    receitaPropinas: 90000000,
    receitaFolhasProva: 10000000,
    receitaUniformes: 20000000
  }
];
