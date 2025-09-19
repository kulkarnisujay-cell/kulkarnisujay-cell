import { WizardFormData, Asset } from '../types';

/**
 * Generates a detailed, formatted string prompt representing the final workflow plan.
 * This prompt is based on the user's configuration in the wizard.
 * @param formData The final state of the wizard's form data.
 * @param assets The original list of assets to differentiate between stages and workflows.
 * @returns A formatted string representing the workflow plan.
 */
export const generateWorkflowPlanPrompt = (formData: WizardFormData, assets: Asset[]): string => {
  let prompt = 'Workflow Plan\n\n';

  // --- CONFIGURATION ---
  prompt += `    - Workflow Type: ${formData.workflowConfig.workflowType || 'N/A'}\n`;
  prompt += `    - Fleet: ${formData.workflowConfig.fleet}\n`;
  prompt += `    - Description: ${formData.workflowConfig.description || 'N/A'}\n`;
  prompt += `    - Directory for workflow code: ${formData.workflowConfig.directory || 'N/A'}\n`;

  // --- STAGES & WORKFLOWS ---
  const stages = formData.stages.filter(s => {
    const asset = assets.find(a => a.name === s.name);
    return asset?.type === 'stage';
  });
  const embeddedWorkflows = formData.stages.filter(s => {
     const asset = assets.find(a => a.name === s.name);
    return asset?.type === 'workflow';
  });

  if (stages.length > 0) {
    prompt += `    - Stages:\n`;
    stages.forEach(s => {
      prompt += `        - ${s.stageName}\n`;
    });
  }
  if (embeddedWorkflows.length > 0) {
    prompt += `    - Embedded Workflows:\n`;
    embeddedWorkflows.forEach(w => {
      prompt += `        - ${w.stageName}\n`;
    });
  }
  
  // --- PUBLIC I/O ---
  if (formData.publicInputs.length > 0) {
    prompt += `    - Public Inputs:\n`;
    formData.publicInputs.forEach(input => {
      if(input.name) prompt += `        - \`${input.name}\` public input (\`${input.type}\` public input type): \`${input.description || 'No description.'}\`\n`;
    });
  }
  if (formData.publicOutputs.length > 0) {
    prompt += `    - Public Outputs:\n`;
    formData.publicOutputs.forEach(output => {
       if(output.name) prompt += `        - \`${output.name}\` public output (\`${output.type}\` public output type):\`${output.description || 'No description.'}\`\n`;
    });
  }

  // --- DEPENDENCIES ---
  if (formData.stages.length > 0) {
    prompt += `    - Stage/Workflow Dependencies:\n`;
    formData.stages.forEach(stage => {
      const dependencies = formData.connections
        .filter(c => c.destination === stage.id && c.sourceType === 'Stage Output Field')
        .map(c => formData.stages.find(s => s.id === c.source)?.stageName)
        .filter((name): name is string => !!name);

      if (dependencies.length > 0) {
        prompt += `        - ${stage.stageName} (depends on ${dependencies.join(', ')})\n`;
      } else {
        prompt += `        - ${stage.stageName} (doesn't depend on any other stages or workflows)\n`;
      }
    });
  }

  const getStageName = (id: string) => formData.stages.find(s => s.id === id)?.stageName;

  // --- FIELD CONNECTIONS ---
  const stageConnections = formData.connections.filter(c => c.sourceType === 'Stage Output Field' && c.destinationType === 'Stage Input Field');
  if (stageConnections.length > 0) {
    prompt += `    - Stage/Workflow Field Connections:\n`;
    stageConnections.forEach(c => {
      const sourceStageName = getStageName(c.source);
      const destStageName = getStageName(c.destination);
      if (sourceStageName && destStageName) {
        prompt += `        - ${sourceStageName}'s \`${c.sourceField}\` stage output field will be connected\n        to ${destStageName}'s \`${c.destinationField}\` stage input field\n`;
      }
    });
  }
  
  // --- PUBLIC INPUT CONNECTIONS ---
  const publicInputConnections = formData.connections.filter(c => c.sourceType === 'Public Input');
  if (publicInputConnections.length > 0) {
    prompt += `    - Public Input Connections:\n`;
    publicInputConnections.forEach(c => {
      const destStageName = getStageName(c.destination);
      if (destStageName) {
        prompt += `        - \`${c.sourceField}\` public input will be connected to ${destStageName}'s \`${c.destinationField}\` stage input field.\n`;
      }
    });
  }
  
  // --- PUBLIC OUTPUT CONNECTIONS ---
  const publicOutputConnections = formData.connections.filter(c => c.destinationType === 'Public Output');
  if (publicOutputConnections.length > 0) {
    prompt += `    - Public Output Connections:\n`;
    publicOutputConnections.forEach(c => {
      const sourceStageName = getStageName(c.source);
      const publicOutput = formData.publicOutputs.find(o => o.id === c.destination);
      if (sourceStageName && publicOutput) {
        prompt += `        - ${sourceStageName}'s \`${c.sourceField}\` stage output field will be connected to \`${publicOutput.name}\` public output.\n`;
      }
    });
  }

  return prompt.trim();
};
