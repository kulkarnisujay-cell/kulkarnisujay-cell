import React, { useState, useEffect, useCallback } from 'react';
import { Asset, WizardStage, Connection, WizardFormData, PublicIO, IOField } from '../types';
import { prepopulateWorkflow } from '../services/workflowService';
import { mockAssets } from '../data/assets';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import DependencyGraph from './DependencyGraph';

interface WorkflowWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAssets: Asset[];
  onGeneratePlan: (formData: WizardFormData) => void;
}

const STEPS = ['Configuration', 'Stages & Connections', 'Review'];

const getAssetByName = (name: string): Asset | undefined => mockAssets.find(a => a.name === name);

const WorkflowWizardModal: React.FC<WorkflowWizardModalProps> = ({ isOpen, onClose, initialAssets, onGeneratePlan }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>({
    workflowConfig: { workflowType: 'I_AM_AWESOME', fleet: 'NON_PROD', directory: 'knowledge/graph/jarvis/config/workflows/i_am_awesome', description: 'An awesome workflow' },
    stages: [],
    publicInputs: [],
    publicOutputs: [],
    connections: [],
  });

  useEffect(() => {
    if (initialAssets.length > 0) {
      const { stages, connections } = prepopulateWorkflow(initialAssets);
      const description = `A workflow to orchestrate: ${stages.map(s => s.stageName).join(', ')}.`;
      setFormData(prev => ({ 
        ...prev, 
        stages, 
        connections,
        workflowConfig: { ...prev.workflowConfig, description }
      }));
    } else {
      // Reset if modal is opened with no assets
      setFormData({
        workflowConfig: { workflowType: 'I_AM_AWESOME', fleet: 'NON_PROD', directory: 'knowledge/graph/jarvis/config/workflows/i_am_awesome', description: 'An awesome workflow' },
        stages: [], publicInputs: [], publicOutputs: [], connections: []
      });
    }
  }, [initialAssets]);

  const handleStageNameChange = (id: string, newStageName: string) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map(s => s.id === id ? { ...s, stageName: newStageName } : s)
    }));
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const newStages = [...prev.stages];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newStages.length) return prev;
      [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
      
      // Invalidate connections that now point backwards
      const validConnections = prev.connections.filter(conn => {
        if(conn.sourceType !== 'Stage Output Field' || conn.destinationType !== 'Stage Input Field') return true;
        const sourceIndex = newStages.findIndex(s => s.id === conn.source);
        const destIndex = newStages.findIndex(s => s.id === conn.destination);
        return sourceIndex < destIndex;
      });

      return { ...prev, stages: newStages, connections: validConnections };
    });
  };

  const handleConnectionChange = (destType: 'Stage Input Field' | 'Public Output', destId: string, destField: string, sourceValue: string) => {
    setFormData(prev => {
      const newConnections = prev.connections.filter(c => !(c.destination === destId && c.destinationField === destField));

      if (sourceValue) {
        const [sourceType, sourceId, sourceField] = sourceValue.split('::');
        const newConn: Connection = {
          id: `conn-${Date.now()}`,
          sourceType: sourceType === 'public-input' ? 'Public Input' : 'Stage Output Field',
          source: sourceId,
          sourceField: sourceField,
          destinationType: destType,
          destination: destId,
          destinationField: destField,
        };
        newConnections.push(newConn);
      }
      return { ...prev, connections: newConnections };
    });
  };
  
  const handlePublicIOChange = (type: 'publicInputs' | 'publicOutputs', index: number, field: keyof PublicIO, value: string) => {
    setFormData(prev => ({
        ...prev,
        [type]: prev[type].map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const addPublicIO = (type: 'publicInputs' | 'publicOutputs') => {
    const newItem: PublicIO = { id: `public-${type}-${Date.now()}`, name: '', type: 'String', description: ''};
    setFormData(prev => ({ ...prev, [type]: [...prev[type], newItem] }));
  };

  const removePublicIO = (type: 'publicInputs' | 'publicOutputs', id: string) => {
      setFormData(prev => ({
          ...prev,
          [type]: prev[type].filter(item => item.id !== id),
          connections: prev.connections.filter(c => c.source !== id && c.destination !== id)
      }));
  };

  const renderContent = useCallback(() => {
    switch (step) {
      case 0: // Configuration
        return (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800">Workflow Configuration</h3>
            <p className="text-sm text-gray-500">Define the basic properties of your new workflow.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                 {Object.entries(formData.workflowConfig).map(([key, value]) => (
                     <div key={key} className={key === 'description' ? 'md:col-span-2' : ''}>
                         <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                          <input
                           type="text"
                           value={value}
                           onChange={(e) => setFormData(prev => ({...prev, workflowConfig: {...prev.workflowConfig, [key]: e.target.value}}))}
                           className="w-full bg-white text-slate-800 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                         />
                     </div>
                 ))}
             </div>
          </div>
        );
      case 1: // Stages & Connections
        return (
          <div className="space-y-6 animate-fade-in">
             <div>
                <h3 className="text-xl font-bold text-slate-800">Public Inputs</h3>
                <p className="text-sm text-gray-500">Define inputs that can be passed to the workflow at runtime.</p>
                {/* Public Inputs Form */}
                <div className="mt-4 space-y-2">
                    {formData.publicInputs.map((input, index) => (
                        <div key={input.id} className="flex gap-2 items-center">
                            <input type="text" placeholder="Name" value={input.name} onChange={e => handlePublicIOChange('publicInputs', index, 'name', e.target.value)} className="form-input flex-1 bg-white text-slate-800"/>
                            <input type="text" placeholder="Type" value={input.type} onChange={e => handlePublicIOChange('publicInputs', index, 'type', e.target.value)} className="form-input flex-1 bg-white text-slate-800"/>
                            <input type="text" placeholder="Description" value={input.description} onChange={e => handlePublicIOChange('publicInputs', index, 'description', e.target.value)} className="form-input flex-2 bg-white text-slate-800"/>
                            <button onClick={() => removePublicIO('publicInputs', input.id)}><TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500"/></button>
                        </div>
                    ))}
                </div>
                <button onClick={() => addPublicIO('publicInputs')} className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"><PlusCircleIcon className="h-5 w-5"/> Add Public Input</button>
             </div>
             <hr/>
             <div>
                <h3 className="text-xl font-bold text-slate-800">Stages</h3>
                <p className="text-sm text-gray-500">Review the stages and their connections. Drag to reorder.</p>
                {/* Stages List */}
                <div className="mt-4 space-y-4">
                {formData.stages.map((stage, index) => {
                    const asset = getAssetByName(stage.name);
                    const availableSources = [
                        ...formData.publicInputs.filter(i => i.name).map(i => ({ label: `Workflow Input: ${i.name}`, value: `public-input::${i.id}::${i.name}`})),
                        ...formData.stages.slice(0, index).flatMap(s => {
                            const sourceAsset = getAssetByName(s.name);
                            return sourceAsset?.outputs?.map(o => ({ label: `${s.stageName}: ${o.name}`, value: `stage-output::${s.id}::${o.name}`})) || []
                        })
                    ];

                    return (
                        <div key={stage.id} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <input type="text" value={stage.stageName} onChange={e => handleStageNameChange(stage.id, e.target.value)} className="text-lg font-bold bg-transparent focus:bg-white rounded p-1 -m-1"/>
                                    <span className="text-sm text-gray-400 font-mono">({stage.name})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button disabled={index === 0} onClick={() => handleMoveStage(index, 'up')} className="disabled:opacity-25"><ChevronUpIcon className="h-5 w-5"/></button>
                                    <button disabled={index === formData.stages.length - 1} onClick={() => handleMoveStage(index, 'down')} className="disabled:opacity-25"><ChevronDownIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                             <div className="mt-4 pl-4 border-l-2">
                                <h4 className="font-semibold text-sm mb-2">Inputs</h4>
                                {asset?.inputs?.map(input => {
                                     const connection = formData.connections.find(c => c.destination === stage.id && c.destinationField === input.name);
                                     const value = connection ? `${connection.sourceType === 'Public Input' ? 'public-input' : 'stage-output'}::${connection.source}::${connection.sourceField}` : '';
                                    return (
                                        <div key={input.name} className="grid grid-cols-2 gap-4 items-center mb-2">
                                            <label className="text-sm font-mono text-right pr-2">{input.name}:</label>
                                             <select value={value} onChange={e => handleConnectionChange('Stage Input Field', stage.id, input.name, e.target.value)} className="form-select w-full bg-white text-slate-800">
                                                <option value="">-- Select Source --</option>
                                                {availableSources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                        </div>
                                    )
                                })}
                                 {!asset?.inputs || asset.inputs.length === 0 && <p className="text-sm text-gray-500 italic">No inputs</p>}
                            </div>
                        </div>
                    )
                })}
                </div>
             </div>
             <hr/>
             <div>
                <h3 className="text-xl font-bold text-slate-800">Public Outputs</h3>
                <p className="text-sm text-gray-500">Define outputs that can be accessed after the workflow completes.</p>
                 <div className="mt-4 space-y-2">
                    {/* Public Outputs Form */}
                    {formData.publicOutputs.map((output, index) => {
                         const availableSources = formData.stages.flatMap(s => {
                            const sourceAsset = getAssetByName(s.name);
                            return sourceAsset?.outputs?.map(o => ({ label: `${s.stageName}: ${o.name}`, value: `stage-output::${s.id}::${o.name}`})) || []
                        });
                        const connection = formData.connections.find(c => c.destination === output.id);
                        const value = connection ? `stage-output::${connection.source}::${connection.sourceField}` : '';
                        return(
                            <div key={output.id} className="grid grid-cols-2 gap-4 items-center">
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Name" value={output.name} onChange={e => handlePublicIOChange('publicOutputs', index, 'name', e.target.value)} className="form-input flex-1 bg-white text-slate-800"/>
                                    <input type="text" placeholder="Type" value={output.type} onChange={e => handlePublicIOChange('publicOutputs', index, 'type', e.target.value)} className="form-input flex-1 bg-white text-slate-800"/>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <select value={value} onChange={e => handleConnectionChange('Public Output', output.id, output.name, e.target.value)} className="form-select w-full bg-white text-slate-800">
                                        <option value="">-- Select Source Stage Field --</option>
                                        {availableSources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                    <button onClick={() => removePublicIO('publicOutputs', output.id)}><TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500"/></button>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <button onClick={() => addPublicIO('publicOutputs')} className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"><PlusCircleIcon className="h-5 w-5"/> Add Public Output</button>
             </div>
          </div>
        );
      case 2: // Review
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800">Review & Generate</h3>
            <p className="text-sm text-gray-500 mb-4">Review the final workflow configuration and dependency graph.</p>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold">Dependency Graph</h4>
                    <DependencyGraph stages={formData.stages} connections={formData.connections} />
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [step, formData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] mx-4 flex flex-col animate-fade-in-up">
        <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Create New Workflow</h2>
          <div className="flex items-center gap-4">
            {STEPS.map((name, index) => (
              <div key={name} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === index ? 'bg-blue-600 text-white' : ''} ${step > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {step > index ? <CheckCircleIcon className="w-5 h-5"/> : index + 1}
                </div>
                <span className={`transition-colors ${step === index ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{name}</span>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </header>
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
          {renderContent()}
        </main>
        <footer className="p-4 border-t flex justify-between flex-shrink-0 bg-white">
          <button 
            onClick={() => setStep(s => Math.max(0, s - 1))} 
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeftIcon className="h-4 w-4"/> Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button 
              onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Next <ArrowRightIcon className="h-4 w-4"/>
            </button>
          ) : (
            <button
              onClick={() => onGeneratePlan(formData)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
            >
              <CheckCircleIcon className="h-4 w-4"/> Finish & Generate
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default WorkflowWizardModal;