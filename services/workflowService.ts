import { Asset, WizardStage, Connection } from '../types';
import { historicalPatterns } from '../data/historicalData';

interface PrepResult {
  stages: WizardStage[];
  connections: Connection[];
}

export const prepopulateWorkflow = (selectedAssets: Asset[]): PrepResult => {
  const selectedStageAssets = selectedAssets.filter(asset => asset.type === 'stage');
  
  if (selectedStageAssets.length < 2) {
    // Not enough stages to connect, return them in the order they were selected
    const initialStages: WizardStage[] = selectedStageAssets.map(asset => ({
      id: `${asset.id}-${Math.random().toString(36).substr(2, 9)}`,
      name: asset.name,
      stageName: asset.name,
    }));
    return { stages: initialStages, connections: [] };
  }

  // Find the best historical pattern based on the selected stages
  let bestPattern = null;
  let maxScore = 0;

  const selectedStageNames = new Set(selectedStageAssets.map(a => a.name));

  for (const pattern of historicalPatterns) {
    let currentScore = 0;
    for (const stageName of pattern.sequence) {
      if (selectedStageNames.has(stageName)) {
        currentScore++;
      }
    }
    // We prioritize patterns that are a subset of the selection, to avoid matching huge patterns for a small selection
    if (currentScore > maxScore && currentScore <= selectedStageNames.size) {
      maxScore = currentScore;
      bestPattern = pattern;
    }
  }

  // Generate initial stages with unique IDs
  const initialStages: WizardStage[] = selectedStageAssets.map(asset => ({
    id: `${asset.id}-${Math.random().toString(36).substr(2, 9)}`,
    name: asset.name, // The original asset name
    stageName: asset.name, // The user-editable name
  }));

  if (!bestPattern || maxScore < 2) {
    // No relevant pattern found, or not enough matches to be useful
    return { stages: initialStages, connections: [] };
  }

  // Order the stages based on the best pattern
  const orderedStages: WizardStage[] = [];
  const remainingStages = [...initialStages];

  for (const stageName of bestPattern.sequence) {
    const stageIndex = remainingStages.findIndex(s => s.name === stageName);
    if (stageIndex !== -1) {
      orderedStages.push(remainingStages[stageIndex]);
      remainingStages.splice(stageIndex, 1);
    }
  }

  // Add any selected stages that were not in the pattern to the end
  const finalStages = [...orderedStages, ...remainingStages];

  // Create connections based on the pattern
  const finalConnections: Connection[] = [];
  for (const historicalConn of bestPattern.connections) {
    const sourceStage = finalStages.find(s => s.name === historicalConn.sourceStageName);
    const destStage = finalStages.find(s => s.name === historicalConn.destStageName);

    // Ensure both stages in the connection are present in the user's selection
    if (sourceStage && destStage) {
      finalConnections.push({
        id: `conn-${Math.random().toString(36).substr(2, 9)}`,
        sourceType: 'Stage Output Field',
        source: sourceStage.id,
        sourceField: historicalConn.sourceField,
        destinationType: 'Stage Input Field',
        destination: destStage.id,
        destinationField: historicalConn.destField,
      });
    }
  }
  
  return { stages: finalStages, connections: finalConnections };
};
