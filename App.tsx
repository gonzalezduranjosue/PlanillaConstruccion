import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, FileDown, Calculator, User, Hammer, Utensils, FileText, CheckCircle2 } from 'lucide-react';
import { BudgetState, Material, LaborItem } from './types';
import { generateWordDocument } from './utils/docxGenerator';

// Helper for unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function App() {
  const [state, setState] = useState<BudgetState>({
    projectInfo: { projectName: '', beneficiary: '' },
    workers: [
      { id: generateId(), name: '', role: 'Principal' },
      { id: generateId(), name: '', role: 'Ayudante' },
      { id: generateId(), name: '', role: 'Ayudante' },
      { id: generateId(), name: '', role: 'Ayudante' },
    ],
    materials: Array.from({ length: 5 }, () => ({
      id: generateId(),
      description: '',
      quantity: 0,
      unit: '',
      unitPrice: 0
    })),
    labor: Array.from({ length: 3 }, () => ({
      id: generateId(),
      description: '',
      cost: 0
    })),
    diet: { workersCount: 0, workDays: 0, costPerDiet: 0 },
    signatures: { approverName: '', approvalDate: new Date().toISOString().split('T')[0], observations: '' }
  });

  const [isExporting, setIsExporting] = useState(false);

  // Derived State (Calculations)
  const totals = useMemo(() => {
    const materials = state.materials.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const labor = state.labor.reduce((acc, item) => acc + item.cost, 0);
    const diet = state.diet.workersCount * state.diet.workDays * state.diet.costPerDiet;
    return { materials, labor, diet, final: materials + labor + diet };
  }, [state]);

  // Handlers
  const handleProjectInfoChange = (field: keyof typeof state.projectInfo, value: string) => {
    setState(prev => ({ ...prev, projectInfo: { ...prev.projectInfo, [field]: value } }));
  };

  const handleWorkerChange = (id: string, value: string) => {
    setState(prev => ({
      ...prev,
      workers: prev.workers.map(w => w.id === id ? { ...w, name: value } : w)
    }));
  };

  const updateMaterial = (id: string, field: keyof Material, value: any) => {
    setState(prev => ({
      ...prev,
      materials: prev.materials.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const addMaterialRow = () => {
    setState(prev => ({
      ...prev,
      materials: [...prev.materials, { id: generateId(), description: '', quantity: 0, unit: '', unitPrice: 0 }]
    }));
  };

  const removeMaterialRow = (id: string) => {
    setState(prev => ({ ...prev, materials: prev.materials.filter(m => m.id !== id) }));
  };

  const updateLabor = (id: string, field: keyof LaborItem, value: any) => {
    setState(prev => ({
      ...prev,
      labor: prev.labor.map(l => l.id === id ? { ...l, [field]: value } : l)
    }));
  };

  const addLaborRow = () => {
    setState(prev => ({
      ...prev,
      labor: [...prev.labor, { id: generateId(), description: '', cost: 0 }]
    }));
  };

  const removeLaborRow = (id: string) => {
    setState(prev => ({ ...prev, labor: prev.labor.filter(l => l.id !== id) }));
  };

  const handleExport = async (lang: 'es' | 'en') => {
    setIsExporting(true);
    try {
      await generateWordDocument(state, lang, totals);
    } catch (e) {
      console.error(e);
      alert('Error generando documento');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="bg-brand-700 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">BudgetPro</h1>
                <p className="text-brand-100 text-sm">Sistema de Presupuesto para Proyectos</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm opacity-80">Fecha Actual</div>
              <div className="font-mono">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        {/* Section 1: General Info */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-800">Información General</h2>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Proyecto</label>
              <input
                type="text"
                placeholder="Ej: Construcción de anexo"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                value={state.projectInfo.projectName}
                onChange={(e) => handleProjectInfoChange('projectName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Beneficiario Directo</label>
              <input
                type="text"
                placeholder="Nombre del beneficiario"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                value={state.projectInfo.beneficiary}
                onChange={(e) => handleProjectInfoChange('beneficiary', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Workers */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-800">Personal en Obra</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {state.workers.map((worker, idx) => (
                <div key={worker.id}>
                  <label className="block text-xs uppercase tracking-wide font-bold text-slate-500 mb-1">
                    {idx === 0 ? 'Maestro Principal' : `Trabajador ${idx + 1}`}
                  </label>
                  <input
                    type="text"
                    placeholder={`Nombre del ${idx === 0 ? 'maestro' : 'ayudante'}`}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={worker.name}
                    onChange={(e) => handleWorkerChange(worker.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Materials */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hammer className="w-5 h-5 text-brand-600" />
              <h2 className="font-semibold text-slate-800">Materiales y Costos</h2>
            </div>
            <div className="text-sm font-medium text-slate-600">
              Subtotal: <span className="text-brand-700">${totals.materials.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="pb-3 w-10">#</th>
                  <th className="pb-3 pl-2">Descripción</th>
                  <th className="pb-3 w-24">Cant.</th>
                  <th className="pb-3 w-32">Unidad</th>
                  <th className="pb-3 w-32">P. Unit ($)</th>
                  <th className="pb-3 w-32 text-right">Total ($)</th>
                  <th className="pb-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.materials.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-slate-400 font-mono text-sm">{index + 1}</td>
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-500 focus:ring-0 px-0 py-1"
                        placeholder="Nombre material"
                        value={item.description}
                        onChange={(e) => updateMaterial(item.id, 'description', e.target.value)}
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center focus:ring-1 focus:ring-brand-500 focus:outline-none"
                        value={item.quantity || ''}
                        onChange={(e) => updateMaterial(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-3">
                      <select
                        className="w-full bg-white border-0 text-sm text-slate-600 focus:ring-0 cursor-pointer"
                        value={item.unit}
                        onChange={(e) => updateMaterial(item.id, 'unit', e.target.value)}
                      >
                        <option value="">- Sel -</option>
                        <option value="unidad">Unidad</option>
                        <option value="bolsa">Bolsa</option>
                        <option value="kg">Kg</option>
                        <option value="m">Metro</option>
                        <option value="m2">m²</option>
                        <option value="m3">m³</option>
                        <option value="l">Litro</option>
                        <option value="caja">Caja</option>
                        <option value="juego">Juego</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-right focus:ring-1 focus:ring-brand-500 focus:outline-none"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateMaterial(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-3 text-right font-medium text-slate-700">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <button 
                        onClick={() => removeMaterialRow(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addMaterialRow}
              className="mt-4 flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded hover:bg-brand-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar Material
            </button>
          </div>
        </section>

        {/* Section 4: Labor */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
              <h2 className="font-semibold text-slate-800">Mano de Obra</h2>
            </div>
            <div className="text-sm font-medium text-slate-600">
              Subtotal: <span className="text-brand-700">${totals.labor.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {state.labor.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <span className="text-slate-400 font-mono text-sm w-6 text-center">{index + 1}</span>
                  <input
                    type="text"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Descripción del trabajo"
                    value={item.description}
                    onChange={(e) => updateLabor(item.id, 'description', e.target.value)}
                  />
                  <div className="relative w-32">
                    <span className="absolute left-3 top-2 text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-right focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="0.00"
                      value={item.cost || ''}
                      onChange={(e) => updateLabor(item.id, 'cost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <button 
                    onClick={() => removeLaborRow(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addLaborRow}
              className="mt-4 flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded hover:bg-brand-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar Trabajo
            </button>
          </div>
        </section>

        {/* Section 5: Diet */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand-600" />
              <h2 className="font-semibold text-slate-800">Dietas (Alimentación)</h2>
            </div>
            <div className="text-sm font-medium text-slate-600">
              Subtotal: <span className="text-brand-700">${totals.diet.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-6 grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trabajadores</label>
              <input
                type="number"
                min="0"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                value={state.diet.workersCount || ''}
                onChange={(e) => setState(prev => ({ ...prev, diet: { ...prev.diet, workersCount: parseInt(e.target.value) || 0 } }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Días</label>
              <input
                type="number"
                min="0"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                value={state.diet.workDays || ''}
                onChange={(e) => setState(prev => ({ ...prev, diet: { ...prev.diet, workDays: parseInt(e.target.value) || 0 } }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Costo Diario ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                value={state.diet.costPerDiet || ''}
                onChange={(e) => setState(prev => ({ ...prev, diet: { ...prev.diet, costPerDiet: parseFloat(e.target.value) || 0 } }))}
              />
            </div>
          </div>
        </section>

         {/* Section 6: Signatures & Observations */}
         <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Aprobación</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Aprobado Por (Nombre)</label>
                            <input
                                type="text"
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
                                value={state.signatures.approverName}
                                onChange={(e) => setState(prev => ({...prev, signatures: {...prev.signatures, approverName: e.target.value}}))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                            <input
                                type="date"
                                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
                                value={state.signatures.approvalDate}
                                onChange={(e) => setState(prev => ({...prev, signatures: {...prev.signatures, approvalDate: e.target.value}}))}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Observaciones</h3>
                    <textarea 
                        className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Notas adicionales..."
                        value={state.signatures.observations}
                        onChange={(e) => setState(prev => ({...prev, signatures: {...prev.signatures, observations: e.target.value}}))}
                    />
                </div>
            </div>
         </section>

      </main>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-4 z-50">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-600 text-sm hidden sm:block">
            Generador de Presupuestos v2.0
          </div>
          
          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right mr-4">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Presupuesto</div>
              <div className="text-3xl font-bold text-brand-700">${totals.final.toFixed(2)} <span className="text-sm font-normal text-slate-400">MN</span></div>
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={() => handleExport('es')}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                    <FileDown className="w-5 h-5" />
                    <span className="hidden md:inline">Word (Español)</span>
                    <span className="md:hidden">ES</span>
                </button>
                <button 
                    onClick={() => handleExport('en')}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                    <FileDown className="w-5 h-5" />
                    <span className="hidden md:inline">Word (English)</span>
                    <span className="md:hidden">EN</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}