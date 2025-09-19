import React, { useState } from 'react';
import { Asset, IOField } from '../types';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { PinIcon } from './icons/PinIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';


interface AssetCardProps {
  asset: Asset;
  isSelected: boolean;
  onClick: () => void;
  isHighlighted: boolean;
  isExpanded: boolean;
}

const tagColors = {
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
  },
};

const IOSection: React.FC<{ title: string; data?: IOField[] }> = ({ title, data }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden mt-4 bg-white">
      <button
        onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
        }}
        className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
        aria-expanded={isOpen}
      >
        <h5 className="font-semibold text-slate-800">{title}</h5>
        {isOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] overflow-y-auto' : 'max-h-0'}`}>
        <div className="p-1">
          <table className="w-full text-sm">
            <thead className="bg-white">
              <tr>
                <th className="text-left font-semibold text-slate-600 p-2 border-b w-1/4">Name</th>
                <th className="text-left font-semibold text-slate-600 p-2 border-b w-1/4">Type</th>
                <th className="text-left font-semibold text-slate-600 p-2 border-b w-1/2">Description</th>
              </tr>
            </thead>
            <tbody>
              {data.map((field) => (
                <tr key={field.name} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-2 font-mono text-xs text-slate-700 align-top">{field.name}</td>
                  <td className="p-2 font-mono text-xs text-purple-700 align-top">{field.type}</td>
                  <td className="p-2 text-slate-600 align-top">{field.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const AssetCard: React.FC<AssetCardProps> = ({ asset, isSelected, onClick, isHighlighted, isExpanded }) => {
  const colorScheme = asset.tagColor ? tagColors[asset.tagColor] : { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', hoverBorder: 'hover:border-blue-400' };

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-lg border bg-white p-5 transition-all flex flex-col justify-between hover:shadow-lg ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500' : `${colorScheme.border} ${colorScheme.hoverBorder}`
      } ${isHighlighted ? 'animate-pulse-bg ring-2 ring-green-500' : ''}`}
      aria-selected={isSelected}
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-900">{asset.name}</h4>
            {asset.tag && (
              <span className={`rounded px-2 py-0.5 text-xs font-semibold ${colorScheme.bg} ${colorScheme.text}`}>{asset.tag}</span>
            )}
          </div>
          {asset.pinned && <PinIcon className="h-5 w-5 text-gray-400" />}
        </div>
        <p className="mt-2 text-sm text-gray-600">{asset.description}</p>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
            <IOSection title="Inputs" data={asset.inputs} />
            <IOSection title="Outputs" data={asset.outputs} />
        </div>

      </div>
      <div className={`mt-4 flex items-center justify-between transition-opacity ${isExpanded ? 'opacity-0 h-0' : 'opacity-100'}`}>
        <div className="flex items-center -space-x-2">
            {asset.avatar && (
                 <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm border-2 border-white">
                    {asset.avatar}
                </div>
            )}
        </div>
        <ArrowRightIcon className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};

export default AssetCard;