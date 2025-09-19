import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AssetHub from './components/AssetHub';
import AgentPanel from './components/AgentPanel';
import { Asset, AgentAction, ChatMessage } from './types';
import WorkflowWizardModal from './components/WorkflowWizardModal';
import IntentModal from './components/IntentModal';
import { mockAssets } from './data/assets';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';
import { generateWorkflowPlanPrompt } from './services/promptService';


const App: React.FC = () => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [highlightedAssetIds, setHighlightedAssetIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(true);

  const handleAssetSelect = (asset: Asset, isSelected: boolean) => {
    setSelectedAssets(prev =>
      isSelected ? [...prev, asset] : prev.filter(a => a.id !== asset.id)
    );
  };

  const handleAgentAction = (action: AgentAction) => {
    if (action.type === 'highlight_asset') {
      const idsToHighlight = mockAssets
        .filter(a => action.assetNames.includes(a.name))
        .map(a => a.id);
      
      if (idsToHighlight.length > 0) {
        setHighlightedAssetIds(idsToHighlight);
        setTimeout(() => setHighlightedAssetIds([]), 4000); // Clear highlight after 4s
      }
    }
  };

  const handleStartFromScratch = () => {
    setIsIntentModalOpen(false);
  };
  
  const handleIntentSubmit = (intent: string) => {
      setIsIntentModalOpen(false);
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: intent,
      };
      setMessages([userMessage]);
  };

  const handleGeneratePlan = (formData: any) => {
    const plan = generateWorkflowPlanPrompt(formData, mockAssets);
    const planMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'agent',
      text: `---
Workflow Plan

${plan}
---`
    };
    setMessages(prev => [...prev, planMessage]);
    setIsWizardOpen(false);
    setSelectedAssets([]);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />
      <main className="relative flex flex-1 flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1 flex flex-col">
            <AssetHub 
              selectedAssets={selectedAssets} 
              onAssetSelect={handleAssetSelect}
              highlightedAssetIds={highlightedAssetIds}
            />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
              <button 
                onClick={() => setIsWizardOpen(true)}
                disabled={selectedAssets.length === 0}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 flex items-center gap-2"
              >
                <span>Create Workflow ({selectedAssets.length})</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <AgentPanel 
            onAgentAction={handleAgentAction} 
            messages={messages}
            setMessages={setMessages}
          />
        </div>
      </main>

      {isWizardOpen && (
        <WorkflowWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          initialAssets={selectedAssets}
          onGeneratePlan={handleGeneratePlan}
        />
      )}

       {isIntentModalOpen && (
        <IntentModal
          isOpen={isIntentModalOpen}
          onClose={() => setIsIntentModalOpen(false)}
          onStartFromScratch={handleStartFromScratch}
          onIntentSubmit={handleIntentSubmit}
        />
      )}
    </div>
  );
};

export default App;