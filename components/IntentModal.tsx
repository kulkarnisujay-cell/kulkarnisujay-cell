import React, { useState } from 'react';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

// Fix: Create the IntentModal component to resolve 'Cannot find name' errors.
// This file was missing and is required by the main App component.
const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.681 4.06c.064.155.19.284.348.348l4.06 1.681c.772.321.772 1.415 0 1.736l-4.06 1.681c-.158.064-.284.19-.348.348l-1.681 4.06c-.321.772-1.415.772-1.736 0l-1.681-4.06c-.064-.155-.19-.284-.348-.348l-4.06-1.681c-.772-.321-.772-1.415 0-1.736l4.06-1.681c.158.064.284.19.348.348l1.681-4.06z" clipRule="evenodd" />
    </svg>
);

interface IntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIntentSubmit: (intent: string) => void;
  onStartFromScratch: () => void;
}

const IntentModal: React.FC<IntentModalProps> = ({ isOpen, onClose, onIntentSubmit, onStartFromScratch }) => {
  const [intent, setIntent] = useState('');

  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (intent.trim()) {
      onIntentSubmit(intent);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 transform transition-all">
        <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
               <SparkleIcon className="w-6 h-6 text-blue-600"/>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Build your workflow with AI</h2>
            <p className="mt-2 text-base text-gray-500">
                Describe the workflow you want to create, or start from scratch by selecting assets yourself.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
            <textarea
                rows={4}
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g., 'Create a workflow that submits a changelist, then creates a Buganizer issue with the CL number.'"
                className="w-full resize-none rounded-lg border bg-white border-gray-300 text-slate-800 placeholder-gray-400 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
             <button 
              type="submit" 
              className="w-full mt-4 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              disabled={!intent.trim()}
            >
              <span>Generate Workflow</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
        </form>
        
        <div className="mt-6 text-center">
            <button onClick={onStartFromScratch} className="text-sm font-medium text-gray-600 hover:text-gray-800">
                Or, start from scratch
            </button>
        </div>
      </div>
    </div>
  );
};

export default IntentModal;
