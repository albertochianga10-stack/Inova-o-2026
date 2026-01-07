
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialData, Indicators, AIAnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeFinancialHealth(
  data: FinancialData,
  indicators: Indicators
): Promise<AIAnalysisResponse> {
  const prompt = `
    Aja como um Consultor Financeiro Sênior especializado no mercado de Angola e no Plano Geral de Contabilidade (PGC) Angolano. 
    Analise os seguintes dados financeiros em Kwanzas (Kz) e indicadores de uma empresa:
    
    DADOS: ${JSON.stringify(data)}
    INDICADORES CALCULADOS: ${JSON.stringify(indicators)}

    Contexto Adicional para Angola:
    1. Considere o impacto da inflação e a necessidade de preservação de valor.
    2. Avalie a exposição ao risco cambial (USD/AOA), se aplicável (ex: custos de importação).
    3. Considere obrigações fiscais da AGT (como o IVA e Imposto Industrial).
    4. Analise a liquidez num contexto de acesso restrito a divisas.

    Forneça uma análise dividida em Curto Prazo (0-12m), Médio Prazo (1-3 anos) e Longo Prazo (3+ anos).
    A linguagem deve ser executiva, clara para gestores angolanos.
    Para cada período, defina um status (Otimista, Neutro, Alerta), descreva a situação e dê recomendações estratégicas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortTerm: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                status: { type: Type.STRING, description: "Otimista, Neutro ou Alerta" },
                description: { type: Type.STRING },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "status", "description", "recommendations"]
            },
            midTerm: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                status: { type: Type.STRING },
                description: { type: Type.STRING },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "status", "description", "recommendations"]
            },
            longTerm: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                status: { type: Type.STRING },
                description: { type: Type.STRING },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "status", "description", "recommendations"]
            },
            generalSummary: { type: Type.STRING }
          },
          required: ["shortTerm", "midTerm", "longTerm", "generalSummary"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    throw error;
  }
}
