// Fix: Define and export all necessary types for the application.
// This resolves numerous import errors across multiple files.
export interface IOField {
  name: string;
  type: string;
  description: string;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  type: 'stage' | 'workflow';
  isNew?: boolean;
  category: string;
  owner: string;
  tag?: string;
  tagColor?: 'pink' | 'cyan';
  avatar?: string;
  pinned?: boolean;
  inputs?: IOField[];
  outputs?: IOField[];
}

export interface AgentAction {
  type: 'highlight_asset';
  assetNames: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  isGenerating?: boolean;
}

export interface WizardStage {
  id: string;
  name: string;
  stageName: string;
}

export interface PublicIO extends IOField {
  id: string;
}

export type ConnectionSourceType = 'Public Input' | 'Stage Output Field';
export type ConnectionDestType = 'Stage Input Field' | 'Public Output';

export interface Connection {
  id: string;
  sourceType: ConnectionSourceType;
  source: string;
  sourceField: string;
  destinationType: ConnectionDestType;
  destination: string;
  destinationField: string;
}

export interface WizardFormData {
  workflowConfig: {
    workflowType: string;
    fleet: string;
    directory: string;
    description: string;
  };
  stages: WizardStage[];
  publicInputs: PublicIO[];
  publicOutputs: PublicIO[];
  connections: Connection[];
}