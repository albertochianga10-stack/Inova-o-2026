
import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, LayoutDashboard, FileText, Settings, HelpCircle, 
  Download, BrainCircuit, PlusCircle, Save, TrendingUp, PieChart as PieIcon,
  Table as TableIcon, Landmark, Calculator, AlertCircle, CheckCircle2,
  Menu, Calendar as CalendarIcon, ChevronRight, Wallet, Users, Trash2, Edit3, Plus,
  Layers, School, Bus, FileStack, Shirt
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { MOCK_FINANCIAL_HISTORY } from './constants';
import { FinancialData, AIAnalysisResponse, Employee, PayrollResult } from './types';
import { calculateIndicators, formatCurrency, formatPercent, getStatusColor, calculatePayroll } from './utils/finance';
import IndicatorCard from './components/IndicatorCard';
import { analyzeFinancialHealth } from './services/geminiService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STORAGE_KEY_HISTORY = 'finanalysis_history_v4';
const STORAGE_KEY_EMPLOYEES = 'finanalysis_employees_v4';

type ViewState = 'dashboard' | 'reports' | 'fiscal' | 'payroll';

const App: React.FC = () => {
  // Estado inicial carregado do LocalStorage ou do Mock se vazio
  const [history, setHistory] = useState<FinancialData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : MOCK_FINANCIAL_HISTORY;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'João Manuel', baseSalary: 250000, allowances: 45000, bonus: 10000 },
      { id: '2', name: 'Maria Antónia', baseSalary: 180000, allowances: 30000, bonus: 5000 }
    ];
  });

  const [activePeriodIndex, setActivePeriodIndex] = useState(history.length - 1);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditingEntry, setIsEditingEntry] = useState(false);

  // Sincronização automática com LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  const [formData, setFormData] = useState<FinancialData>({
    period: new Date().toISOString().split('T')[0],
    ativoCirculante: 0,
    ativoNaoCirculante: 0,
    estoques: 0,
    disponibilidades: 0,
    passivoCirculante: 0,
    passivoNaoCirculante: 0,
    patrimonioLiquido: 0,
    receitaLiquida: 0,
    lucroBruto: 0,
    lucroOperacional: 0,
    lucroLiquido: 0,
    vendas: 0,
    custos: 0,
    receitaServicos: 0,
    receitaTransportes: 0,
    receitaPropinas: 0,
    receitaFolhasProva: 0,
    receitaUniformes: 0
  });

  const currentData = history[activePeriodIndex] || history[0];
  const indicators = useMemo(() => calculateIndicators(currentData), [currentData]);

  const sectorRevenueData = useMemo(() => [
    { name: 'Prestações de Serviços', value: currentData.receitaServicos || 0 },
    { name: 'Transportes', value: currentData.receitaTransportes || 0 },
    { name: 'Propinas', value: currentData.receitaPropinas || 0 },
    { name: 'Folhas de Prova', value: currentData.receitaFolhasProva || 0 },
    { name: 'Uniformes', value: currentData.receitaUniformes || 0 },
  ], [currentData]);

  const payrollData = useMemo(() => {
    return employees.map(emp => ({
      employee: emp,
      result: calculatePayroll(emp)
    }));
  }, [employees]);

  const fiscalData = useMemo(() => {
    const impostoIndustrial = currentData.lucroOperacional > 0 ? currentData.lucroOperacional * 0.25 : 0;
    const ivaEstimado = currentData.receitaLiquida * 0.14;
    return {
      impostoIndustrial,
      ivaEstimado,
      totalEstimado: impostoIndustrial + ivaEstimado,
      status: currentData.lucroLiquido > 0 ? 'Regularizado' : 'Pendente'
    };
  }, [currentData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: name === 'period' ? value : Number(value) };
      if (['receitaServicos', 'receitaTransportes', 'receitaPropinas', 'receitaFolhasProva', 'receitaUniformes'].includes(name)) {
        updated.receitaLiquida = (updated.receitaServicos || 0) + 
                               (updated.receitaTransportes || 0) + 
                               (updated.receitaPropinas || 0) + 
                               (updated.receitaFolhasProva || 0) + 
                               (updated.receitaUniformes || 0);
      }
      return updated;
    });
  };

  const openNewEntryModal = () => {
    setIsEditingEntry(false);
    setFormData({
      period: new Date().toISOString().split('T')[0],
      ativoCirculante: 0,
      ativoNaoCirculante: 0,
      estoques: 0,
      disponibilidades: 0,
      passivoCirculante: 0,
      passivoNaoCirculante: 0,
      patrimonioLiquido: 0,
      receitaLiquida: 0,
      lucroBruto: 0,
      lucroOperacional: 0,
      lucroLiquido: 0,
      vendas: 0,
      custos: 0,
      receitaServicos: 0,
      receitaTransportes: 0,
      receitaPropinas: 0,
      receitaFolhasProva: 0,
      receitaUniformes: 0
    });
    setIsModalOpen(true);
  };

  const openEditEntryModal = (entry: FinancialData) => {
    setIsEditingEntry(true);
    setFormData(entry);
    setIsModalOpen(true);
  };

  const deleteHistoryEntry = (index: number) => {
    if (window.confirm("Tem a certeza que deseja eliminar este registo permanentemente?")) {
      const newHistory = history.filter((_, i) => i !== index);
      setHistory(newHistory);
      if (activePeriodIndex >= newHistory.length) {
        setActivePeriodIndex(Math.max(0, newHistory.length - 1));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newHistory;
    if (isEditingEntry) {
      newHistory = history.map(h => h.period === formData.period ? formData : h);
    } else {
      newHistory = [...history, formData].sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
    }
    setHistory(newHistory);
    const newIdx = newHistory.findIndex(h => h.period === formData.period);
    setActivePeriodIndex(newIdx !== -1 ? newIdx : newHistory.length - 1);
    setIsModalOpen(false);
    setAiAnalysis(null);
  };

  const handlePayrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    
    const newEmp: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      name: data.get('name') as string,
      baseSalary: Number(data.get('baseSalary')),
      allowances: Number(data.get('allowances')),
      bonus: Number(data.get('bonus')),
    };

    if (editingEmployee) {
      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? newEmp : emp));
    } else {
      setEmployees([...employees, newEmp]);
    }
    setIsPayrollModalOpen(false);
    setEditingEmployee(null);
  };

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFinancialHealth(currentData, indicators);
      setAiAnalysis(result);
    } catch (e) {
      alert("Erro na conexão com o cérebro AI. Verifique sua chave de API e conexão de internet.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const trendData = useMemo(() => {
    return history.map(item => ({
      name: new Date(item.period).toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' }),
      fullDate: item.period,
      receita: item.receitaLiquida,
      lucro: item.lucroLiquido
    }));
  }, [history]);

  const formatDateLabel = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-AO');
    } catch {
      return dateStr;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter">FinAnalysis AO</h1>
        </div>
        
        <nav className="space-y-1.5">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<FileText size={20} />} label="Relatórios PGC" active={activeView === 'reports'} onClick={() => { setActiveView('reports'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Users size={20} />} label="Salários" active={activeView === 'payroll'} onClick={() => { setActiveView('payroll'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Landmark size={20} />} label="Fiscal AGT" active={activeView === 'fiscal'} onClick={() => { setActiveView('fiscal'); setIsMobileMenuOpen(false); }} />
        </nav>
      </div>

      <div className="px-4 py-2 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="text-[10px] font-black text-slate-500 uppercase px-3 mb-4 tracking-widest">Histórico de Exercícios</h3>
        <div className="space-y-2 pb-6">
          {history.map((h, idx) => (
            <div 
              key={idx}
              className={`group relative flex flex-col p-3 rounded-2xl border transition-all duration-300 ${activePeriodIndex === idx ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800/40 border-transparent text-slate-400 hover:bg-slate-800'}`}
            >
              <button onClick={() => { setActivePeriodIndex(idx); setAiAnalysis(null); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center justify-between mb-2">
                <span className="font-bold text-sm tracking-tight">{formatDateLabel(h.period)}</span>
                <ChevronRight size={14} className={activePeriodIndex === idx ? 'opacity-100' : 'opacity-0'} />
              </button>
              
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={(e) => { e.stopPropagation(); openEditEntryModal(h); }} className="p-1.5 hover:bg-slate-700 rounded-lg text-blue-400"><Edit3 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); deleteHistoryEntry(idx); }} className="p-1.5 hover:bg-slate-700 rounded-lg text-rose-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-6 shrink-0 border-t border-slate-800 bg-slate-900/50">
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-[10px] font-black text-emerald-500 mb-1 uppercase tracking-widest">Online & Sync</p>
          <p className="text-xs text-slate-300 font-medium">Versão 4.0 Pro | AGT</p>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><TableIcon size={20} /></div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-base">Balanço Patrimonial PGC</h3>
          </div>
          <span className="text-xs font-black text-slate-500 bg-slate-200 px-4 py-1.5 rounded-full">{formatDateLabel(currentData.period)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-8 py-4 text-left">Nomenclatura PGC</th>
                <th className="px-8 py-4 text-right">Valor Líquido (Kz)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-emerald-50/20"><td colSpan={2} className="px-8 py-2.5 font-black text-emerald-800 text-[10px] uppercase">Activo Não Corrente</td></tr>
              <ReportRow label="Activo Imobilizado" value={currentData.ativoNaoCirculante} indent />
              <tr className="bg-emerald-50/20"><td colSpan={2} className="px-8 py-2.5 font-black text-emerald-800 text-[10px] uppercase">Activo Corrente</td></tr>
              <ReportRow label="Existências (Estoques)" value={currentData.estoques} indent />
              <ReportRow label="Disponibilidades (Caixa/Bancos)" value={currentData.disponibilidades} indent />
              <ReportRow label="Outros Activos Correntes" value={currentData.ativoCirculante - currentData.estoques - currentData.disponibilidades} indent />
              <tr className="bg-slate-50 font-black text-slate-900 border-y border-slate-200"><td className="px-8 py-6">TOTAL DO ACTIVO</td><td className="px-8 py-6 text-right text-emerald-600 text-lg">{formatCurrency(currentData.ativoCirculante + currentData.ativoNaoCirculante)}</td></tr>
              <tr className="bg-rose-50/20"><td colSpan={2} className="px-8 py-2.5 font-black text-rose-800 text-[10px] uppercase">Passivo e Capital Próprio</td></tr>
              <ReportRow label="Capital Próprio" value={currentData.patrimonioLiquido} indent />
              <ReportRow label="Passivo Não Corrente" value={currentData.passivoNaoCirculante} indent />
              <ReportRow label="Passivo Corrente" value={currentData.passivoCirculante} indent />
              <tr className="bg-slate-900 text-white font-black"><td className="px-8 py-6">TOTAL PASSIVO + CP</td><td className="px-8 py-6 text-right text-emerald-400 text-lg">{formatCurrency(currentData.patrimonioLiquido + currentData.passivoNaoCirculante + currentData.passivoCirculante)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFiscal = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <FiscalCard icon={<Landmark size={20} />} title="Imposto Industrial" value={fiscalData.impostoIndustrial} label="Estimativa AGT (25%)" />
        <FiscalCard icon={<Calculator size={20} />} title="IVA Acumulado" value={fiscalData.ivaEstimado} label="Taxa Padrão (14%)" />
        <FiscalCard icon={<CheckCircle2 size={20} />} title="Status Fiscal" value={0} customValue={fiscalData.status} label="Auditado pela IA" isStatus />
      </div>

      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:scale-110 transition-transform duration-1000"><BrainCircuit size={150} /></div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="font-black text-xl mb-8 flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30"><BrainCircuit size={24} className="text-emerald-400" /></div>
            Consultoria Tributária Inteligente
          </h3>
          <div className="space-y-6 text-slate-300 leading-relaxed font-medium">
            <p className="text-lg">Dada a receita líquida de <span className="text-white font-bold">{formatCurrency(currentData.receitaLiquida)}</span>:</p>
            <ul className="space-y-5">
              <li className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10"><ChevronRight size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Provisionar o pagamento de Imposto Industrial até Maio do próximo exercício.</li>
              <li className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10"><ChevronRight size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Certificar-se de que todas as faturas de aquisição de bens/serviços possuem o NIF correto para dedução de IVA.</li>
              <li className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10"><ChevronRight size={18} className="text-emerald-500 shrink-0 mt-0.5" /> Revisar enquadramento no Regime Geral ou de Exclusão conforme faturamento anual.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayroll = () => (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Massa Salarial Mensal</p>
          <p className="text-3xl font-black text-slate-800">{formatCurrency(payrollData.reduce((acc, curr) => acc + curr.result.grossSalary, 0))}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Retenção IRT (AGT)</p>
          <p className="text-3xl font-black text-blue-600">{formatCurrency(payrollData.reduce((acc, curr) => acc + curr.result.irt, 0))}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Encargo INSS (8%)</p>
          <p className="text-3xl font-black text-emerald-600">{formatCurrency(payrollData.reduce((acc, curr) => acc + curr.result.inssEmployer, 0))}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <Users size={20} className="text-blue-500" /> Folha de Pagamento Detalhada
          </h3>
          <button onClick={() => { setEditingEmployee(null); setIsPayrollModalOpen(true); }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 flex items-center gap-2">
            <Plus size={16} /> Adicionar Funcionário
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-left">Nome do Funcionário</th>
                <th className="px-8 py-5 text-right">Salário Base</th>
                <th className="px-8 py-5 text-right">INSS (3%)</th>
                <th className="px-8 py-5 text-right">IRT AGT</th>
                <th className="px-8 py-5 text-right">Líquido a Receber</th>
                <th className="px-8 py-5 text-center">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollData.map(({ employee, result }) => (
                <tr key={employee.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5 font-black text-slate-800">{employee.name}</td>
                  <td className="px-8 py-5 text-right font-mono font-bold">{formatCurrency(employee.baseSalary)}</td>
                  <td className="px-8 py-5 text-right font-mono text-rose-500 font-bold">-{formatCurrency(result.inssWorker)}</td>
                  <td className="px-8 py-5 text-right font-mono text-amber-600 font-bold">-{formatCurrency(result.irt)}</td>
                  <td className="px-8 py-5 text-right font-black text-emerald-600 font-mono text-base">{formatCurrency(result.netSalary)}</td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingEmployee(employee); setIsPayrollModalOpen(true); }} className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => setEmployees(employees.filter(e => e.id !== employee.id))} className="p-2 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans select-none">
      {/* Sidebar Desktop */}
      <aside className="w-72 bg-slate-900 text-slate-300 hidden lg:flex flex-col border-r border-slate-800 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-slate-50">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all active:scale-95 shadow-sm bg-white"><Menu size={24} /></button>
            <div>
              <h2 className="text-lg lg:text-xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                {activeView === 'dashboard' && `Painel Executivo`}
                {activeView === 'reports' && `Relatórios Financeiros PGC`}
                {activeView === 'payroll' && `Gestão Salarial Angolana`}
                {activeView === 'fiscal' && `Obrigações Fiscais AGT`}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{formatDateLabel(currentData.period)}</p>
            </div>
          </div>
          <button onClick={openNewEntryModal} className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase text-white bg-slate-900 hover:bg-slate-800 rounded-[1.2rem] shadow-xl shadow-slate-900/20 transition-all active:scale-95">
            <PlusCircle size={18} /> <span className="hidden md:inline">Lançar Dados PGC</span><span className="md:hidden">Novo</span>
          </button>
        </header>

        <div className="p-6 lg:p-10 space-y-10 pb-32 max-w-[1600px] mx-auto w-full">
          {activeView === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <IndicatorCard id="liquidezCorrente" value={indicators.liquidezCorrente} />
                <IndicatorCard id="liquidezSeca" value={indicators.liquidezSeca} />
                <IndicatorCard id="margemLiquida" value={indicators.margemLiquida} isPercent />
                <IndicatorCard id="roe" value={indicators.roe} isPercent />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight text-base">
                        <TrendingUp size={22} className="text-emerald-500" /> Fluxo de Crescimento
                      </h3>
                      <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Receita</span>
                        <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Lucro Líquido</span>
                      </div>
                   </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000000}M`} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                        <Tooltip contentStyle={{borderRadius: '24px', border: 'none', padding: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} formatter={(val: number) => formatCurrency(val)} />
                        <Area type="monotone" dataKey="receita" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeWidth={4} />
                        <Area type="monotone" dataKey="lucro" stroke="#3b82f6" fill="transparent" strokeWidth={4} strokeDasharray="8 4" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col">
                   <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tight text-base">
                    <Layers size={22} className="text-blue-500" /> Performance Sectorial
                  </h3>
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={sectorRevenueData} margin={{ left: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} width={130} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{borderRadius: '20px'}} formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={24}>
                          {sectorRevenueData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FATURAMENTO TOTAL</span>
                    <span className="text-lg font-black text-slate-900 tracking-tighter">{formatCurrency(currentData.receitaLiquida)}</span>
                  </div>
                </div>
              </div>

              <section className="bg-slate-900 rounded-[3.5rem] p-10 lg:p-16 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                <div className="absolute top-0 right-0 p-16 opacity-5 scale-150 rotate-12"><BrainCircuit size={250} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-12">
                    <div className="p-4 bg-emerald-500/20 rounded-[1.5rem] border border-emerald-500/30 shadow-inner">
                      <BrainCircuit className="text-emerald-400 w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">Inteligência Estratégica AI</h2>
                      <p className="text-xs text-emerald-400/70 font-bold uppercase tracking-[0.3em]">Angola Market Insight</p>
                    </div>
                  </div>

                  {!aiAnalysis ? (
                    <div className="flex flex-col items-center py-16 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                      <p className="text-slate-400 mb-10 max-w-lg text-center font-medium leading-relaxed">Nossa AI cruza os dados do PGC com os indicadores de liquidez para fornecer um diagnóstico executivo em tempo real.</p>
                      <button onClick={handleRunAIAnalysis} disabled={isAnalyzing} className="py-5 px-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.2rem] font-black uppercase tracking-widest transition-all shadow-2xl shadow-emerald-900/60 active:scale-95 disabled:opacity-50">
                        {isAnalyzing ? "Sincronizando com o Cérebro..." : "Iniciar Diagnóstico Profundo"}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {['shortTerm', 'midTerm', 'longTerm'].map((term) => {
                        const data = (aiAnalysis as any)[term];
                        return (
                          <div key={term} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/15 transition-all duration-500 group">
                            <h4 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center justify-between">
                              {term === 'shortTerm' ? 'Curto Prazo' : term === 'midTerm' ? 'Médio Prazo' : 'Longo Prazo'}
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border-2 ${getStatusColor(data.status)} group-hover:scale-110 transition-transform`}>{data.status}</span>
                            </h4>
                            <p className="text-sm text-slate-300 mb-10 leading-relaxed font-medium h-28 overflow-y-auto custom-scrollbar pr-2">{data.description}</p>
                            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                              <div className="w-4 h-[2px] bg-emerald-500" /> Roteiro de Acção
                            </h5>
                            <ul className="space-y-4">
                              {data.recommendations.map((r: string, i: number) => <li key={i} className="text-xs text-slate-400 flex gap-3 leading-snug"><Plus size={14} className="text-emerald-500 shrink-0 mt-0.5" /> {r}</li>)}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeView === 'reports' && renderReports()}
          {activeView === 'fiscal' && renderFiscal()}
          {activeView === 'payroll' && renderPayroll()}
        </div>
      </main>

      {/* Modal PGC Moderno */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-[92vh] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isEditingEntry ? 'Ajuste de Balanço' : 'Novo Lançamento PGC'}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Contabilidade Angolana AGT v4.0</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-slate-200 rounded-full transition-all text-slate-400 active:rotate-90"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-32">
               <section>
                 <div className="flex items-center gap-3 mb-8 pb-3 border-b border-slate-100">
                   <div className="p-2 bg-emerald-50 rounded-xl"><CalendarIcon size={18} className="text-emerald-500"/></div>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Temporalidade e Resultados</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <FormInput label="Data de Fechamento" name="period" value={formData.period} onChange={handleInputChange} type="date" />
                    <FormInput label="Lucro Operacional (Kz)" name="lucroOperacional" value={formData.lucroOperacional} onChange={handleInputChange} type="number" placeholder="0,00" />
                    <FormInput label="Lucro Líquido Final" name="lucroLiquido" value={formData.lucroLiquido} onChange={handleInputChange} type="number" placeholder="0,00" />
                 </div>
               </section>

               <section className="bg-blue-50/30 p-8 rounded-[2.5rem] border border-blue-100/50">
                 <div className="flex items-center gap-3 mb-8 pb-3 border-b border-blue-100">
                   <div className="p-2 bg-blue-500 text-white rounded-xl"><Layers size={18}/></div>
                   <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest">Composição das Receitas (Sectores)</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FormInput label="Prestações de Serviços" name="receitaServicos" value={formData.receitaServicos} onChange={handleInputChange} type="number" />
                    <FormInput label="Transportes Escolar/Geral" name="receitaTransportes" value={formData.receitaTransportes} onChange={handleInputChange} type="number" />
                    <FormInput label="Propinas Funcionários" name="receitaPropinas" value={formData.receitaPropinas} onChange={handleInputChange} type="number" />
                    <FormInput label="Venda Folhas Prova" name="receitaFolhasProva" value={formData.receitaFolhasProva} onChange={handleInputChange} type="number" />
                    <FormInput label="Venda Uniformes" name="receitaUniformes" value={formData.receitaUniformes} onChange={handleInputChange} type="number" />
                    <div className="bg-white p-6 rounded-3xl border border-blue-100 flex flex-col justify-center shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receita Líquida Total</span>
                      <span className="text-xl font-black text-blue-600 tracking-tighter">{formatCurrency(formData.receitaLiquida)}</span>
                    </div>
                 </div>
               </section>

               <section>
                 <div className="flex items-center gap-3 mb-8 pb-3 border-b border-slate-100">
                   <div className="p-2 bg-rose-50 rounded-xl"><Landmark size={18} className="text-rose-500"/></div>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Balanço Patrimonial</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FormInput label="Ativo Corrente" name="ativoCirculante" value={formData.ativoCirculante} onChange={handleInputChange} type="number" />
                    <FormInput label="Ativo Não Corrente" name="ativoNaoCirculante" value={formData.ativoNaoCirculante} onChange={handleInputChange} type="number" />
                    <FormInput label="Passivo Corrente" name="passivoCirculante" value={formData.passivoCirculante} onChange={handleInputChange} type="number" />
                    <FormInput label="Capital Próprio" name="patrimonioLiquido" value={formData.patrimonioLiquido} onChange={handleInputChange} type="number" />
                 </div>
               </section>
            </form>
            
            <div className="p-10 border-t border-slate-100 bg-white absolute bottom-0 left-0 right-0 flex gap-6">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black uppercase tracking-widest text-xs text-slate-400 hover:bg-slate-50 rounded-[1.2rem] transition-all">Descartar</button>
              <button onClick={handleSubmit} className="flex-[2] py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-[1.2rem] shadow-2xl shadow-slate-900/30 hover:bg-black transition-all active:scale-95">Salvar Registo Financeiro</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Salários */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in">
            <h2 className="text-2xl font-black text-slate-900 mb-10 uppercase tracking-tighter">{editingEmployee ? 'Alterar Cadastro' : 'Novo Cadastro RH'}</h2>
            <form onSubmit={handlePayrollSubmit} className="space-y-6">
              <FormInput label="Nome Completo" name="name" defaultValue={editingEmployee?.name} placeholder="Ex: João Manuel" required />
              <FormInput label="Salário Base (Kz)" name="baseSalary" type="number" defaultValue={editingEmployee?.baseSalary} required />
              <FormInput label="Subsídios Isentos (Kz)" name="allowances" type="number" defaultValue={editingEmployee?.allowances} />
              <FormInput label="Bónus/Extra Tributável (Kz)" name="bonus" type="number" defaultValue={editingEmployee?.bonus} />
              <div className="flex gap-4 mt-12">
                <button type="button" onClick={() => setIsPayrollModalOpen(false)} className="flex-1 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                <button type="submit" className="flex-[2] py-5 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        input[type="number"]::-webkit-inner-spin-button { display: none; }
        @media (max-width: 640px) {
          .recharts-cartesian-axis-tick { font-size: 8px !important; }
        }
      `}</style>
    </div>
  );
};

// Componentes Auxiliares
const FormInput: React.FC<any> = ({ label, ...props }) => (
  <div className="space-y-2.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
    <input 
      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.2rem] text-sm font-black text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
      {...props} 
    />
  </div>
);

const NavItem: React.FC<any> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 translate-x-1' : 'text-slate-500 hover:bg-slate-800/80 hover:text-white'}`}
  >
    <span className={active ? 'text-white' : 'text-slate-600 group-hover:text-emerald-400'}>{icon}</span>
    <span className="font-black text-[11px] uppercase tracking-wider">{label}</span>
  </button>
);

const ReportRow: React.FC<{ label: string; value: number; indent?: boolean; negative?: boolean }> = ({ label, value, indent = false, negative = false }) => (
  <tr className="hover:bg-slate-50/80 transition-colors group">
    <td className={`px-8 py-5 text-slate-600 font-bold ${indent ? 'pl-16 relative before:content-[""] before:absolute before:left-10 before:top-1/2 before:w-3 before:h-[2px] before:bg-slate-300' : ''}`}>{label}</td>
    <td className={`px-8 py-5 text-right font-black font-mono text-xs ${negative ? 'text-rose-500' : 'text-slate-900 group-hover:text-emerald-600'}`}>{formatCurrency(value)}</td>
  </tr>
);

const FiscalCard: React.FC<{ icon: React.ReactNode; title: string; value: number; label: string; customValue?: string; isStatus?: boolean }> = ({ icon, title, value, label, customValue, isStatus }) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all group cursor-default">
    <div className="flex items-center gap-3 text-slate-400 mb-6 uppercase text-[10px] font-black tracking-[0.2em] group-hover:text-emerald-500 transition-colors">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors shadow-inner">{icon}</div> {title}
    </div>
    <div className={`text-2xl lg:text-3xl font-black tracking-tighter ${isStatus ? 'text-emerald-600' : 'text-slate-900'}`}>
      {customValue || formatCurrency(value)}
    </div>
    <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">{label}</p>
  </div>
);

export default App;
