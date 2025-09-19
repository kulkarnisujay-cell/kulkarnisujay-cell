import React, { useState, useEffect, useRef } from 'react';
import { WizardStage, Connection } from '../types';

interface DependencyGraphProps {
  stages: WizardStage[];
  connections: Connection[];
}

interface NodePosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Line {
  id: string;
  path: string;
  sourceStageName: string;
  destStageName: string;
  sourceField: string;
  destField: string;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ stages, connections }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    const calculateLayout = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const nodePositions: Record<string, NodePosition> = {};
      
      stages.forEach(stage => {
        const nodeEl = nodeRefs.current[stage.id];
        if (nodeEl) {
          const rect = nodeEl.getBoundingClientRect();
          nodePositions[stage.id] = {
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.left,
            width: rect.width,
            height: rect.height,
          };
        }
      });
      
      const newLines: Line[] = connections
        .map(conn => {
          // We only visualize stage-to-stage connections in this graph
          if (conn.sourceType !== 'Stage Output Field' || conn.destinationType !== 'Stage Input Field') {
            return null;
          }

          const sourcePos = nodePositions[conn.source];
          const destPos = nodePositions[conn.destination];
          
          if (!sourcePos || !destPos) {
            return null;
          }

          const startX = sourcePos.left + sourcePos.width;
          const startY = sourcePos.top + sourcePos.height / 2;
          
          const endX = destPos.left;
          const endY = destPos.top + destPos.height / 2;

          const controlPointX1 = startX + 60;
          const controlPointY1 = startY;
          const controlPointX2 = endX - 60;
          const controlPointY2 = endY;
          
          const path = `M ${startX} ${startY} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endX} ${endY}`;
          
          const sourceStage = stages.find(s => s.id === conn.source);
          const destStage = stages.find(s => s.id === conn.destination);

          return {
            id: conn.id,
            path,
            sourceStageName: sourceStage?.stageName || '?',
            destStageName: destStage?.stageName || '?',
            sourceField: conn.sourceField,
            destField: conn.destinationField,
          };
        })
        .filter((line): line is Line => line !== null);

      setLines(newLines);
    };

    const timeoutId = setTimeout(calculateLayout, 100);
    window.addEventListener('resize', calculateLayout);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateLayout);
    };
  }, [stages, connections]);

  return (
    <div className="relative w-full overflow-x-auto p-4 bg-gray-50/50 border rounded-lg min-h-[200px]" ref={containerRef}>
      <div className="flex items-start gap-12 py-8 min-w-max">
        {stages.map(stage => (
          <div 
            key={stage.id} 
            ref={el => { nodeRefs.current[stage.id] = el; }}
            className="w-56 bg-white p-4 rounded-lg shadow-md border flex flex-col items-center"
          >
            <div className="font-bold text-slate-800 text-center">{stage.stageName}</div>
            <div className="text-xs text-gray-400 font-mono mt-1">({stage.name})</div>
          </div>
        ))}
      </div>
      <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
         <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
        </defs>
        {lines.map(line => (
          <g key={line.id} className="transition-opacity hover:opacity-100 opacity-80">
             <path
              d={line.path}
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
            <title>{`${line.sourceStageName}.${line.sourceField}  ->  ${line.destStageName}.${line.destField}`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default DependencyGraph;
