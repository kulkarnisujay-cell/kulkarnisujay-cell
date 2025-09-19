import { Asset } from '../types';

export const mockAssets: Asset[] = [
    { 
      id: '2', name: 'SUBMIT_CHANGELIST', 
      description: 'This is a block of placeholder text. You can replace it when you\'re ready.', 
      type: 'stage', isNew: true, category: 'CI/CD', owner: 'jarvis-team',
      tag: 'Prod', tagColor: 'pink', avatar: '🤖', pinned: true,
      inputs: [
        { name: 'changelist_id', type: 'String', description: 'The ID of the changelist to submit.' },
        { name: 'force_submit', type: 'Bool', description: 'Force submit even with warnings.' },
      ], 
      outputs: [
        { name: 'submitted_revision', type: 'String', description: 'The revision number after submission.' },
      ]
    },
    { 
      id: '1', name: 'CODEMAKER', 
      description: 'This is a block of placeholder text. You can replace it when you\'re ready.', 
      type: 'stage', isNew: true, category: 'Build', owner: 'jarvis-team',
      tag: 'Non-prod', tagColor: 'cyan', avatar: 'A', pinned: true,
      inputs: [
        { name: 'build_target', type: 'String', description: 'The target to build.' }
      ], 
      outputs: [
        { name: 'build_artifact', type: 'Blob', description: 'The resulting build artifact.' },
      ]
    },
    {
      id: '7',
      name: 'AI Raters',
      description: 'This is a block of placeholder text. You can replace it when you\'re ready.',
      type: 'stage',
      isNew: true,
      category: 'AI/ML',
      owner: 'ratings-team',
      tag: 'Prod',
      tagColor: 'pink',
      avatar: '⭐',
      inputs: [
        { name: 'model_config_name', type: 'StringArtifactDataProto', description: 'The name of the model config.' },
        { name: 'model_count', type: 'IntArtifactDataProto', description: 'The number of model servers to start.' },
        { name: 'stop_model', type: 'BoolArtifactDataProto', description: 'Whether to stop the model first before starting the model server.' },
        { name: 'checkpoint_path', type: 'StringArtifactDataProto', description: 'Custom checkpoint path.' },
        { name: 'is_on_demand', type: 'BoolArtifactDataProto', description: 'Whether the model is on_demand model. The on_demand will be launched using thin mint by default.' }
      ],
      outputs: [
        { name: 'model_deployment_config', type: 'BlobArtifactDataProto', description: 'Model deployment config.' },
        { name: 'model_stopping_config', type: 'BlobArtifactDataProto', description: 'Stop model server config.' },
        { name: 'model_importance_config', type: 'BlobArtifactDataProto', description: 'Update model importance config.' },
        { name: 'failed_work_unit_restarter_config', type: 'BlobArtifactDataProto', description: 'Write the failed work unit restarter config.' },
        { name: 'auto_scaler_config_writer_config', type: 'BlobArtifactDataProto', description: 'Write the autoscaler config.' }
      ]
    },
    {
      id: '8',
      name: 'Active Union Cells',
      description: 'This is a block of placeholder text. You can replace it when you\'re ready.',
      type: 'stage',
      isNew: true,
      category: 'Infrastructure',
      owner: 'corp-eng',
      tag: 'Prod',
      tagColor: 'pink',
      avatar: '🌐',
      inputs: [
        { name: 'targets', type: 'StringArtifactDataProto', description: 'Comma-separated names of Union targets to fetch Union cells where the targets reside.' },
        { name: 'cells_override', type: 'StringArtifactDataProto', description: 'Optional. Set to a comma-separated list of cells to pass through to the output. This is used in cases where a workflow hard-codes a list of cells.' }
      ],
      outputs: [
        { name: 'cells', type: 'StringArtifactDataProto', description: 'List of cells containing the union of all Union cells where the input targets reside.' }
      ]
    },
    { 
      id: '6', name: 'CODEMAKER', 
      description: 'This is a block of placeholder text. You can replace it when you\'re ready.', 
      type: 'stage', category: 'Build', owner: 'jarvis-team',
      tag: 'Prod', tagColor: 'pink', avatar: '🧑‍💻',
      inputs: [], outputs: []
    },
    { 
      id: '3', name: 'UPDATE_DESCRIPTION', 
      description: 'Updates the description of a CL or a Buganizer issue.', 
      type: 'stage', category: 'Tooling', owner: 'developer-tools',
      tag: 'Prod', tagColor: 'pink', avatar: '🤖',
      inputs: [
        { name: 'changelist_id', type: 'String', description: 'The ID of the changelist to update.' },
        { name: 'new_description', type: 'String', description: 'The new description text.' },
      ], 
      outputs: []
    },
    { 
      id: '4', name: 'SYNC_GREEN_CL', 
      description: 'Syncs a "green" (passing tests) changelist to the main branch.', 
      type: 'workflow', category: 'CI/CD', owner: 'jarvis-team',
      tag: 'Non-prod', tagColor: 'cyan', avatar: 'A',
      inputs: [], outputs: []
    },
    { 
      id: '5', name: 'CREATE_BUGANIZER_ISSUE', 
      description: 'Creates a new issue in Buganizer from workflow context.', 
      type: 'stage', category: 'Tooling', owner: 'developer-tools',
      tag: 'Prod', tagColor: 'pink', avatar: '🧑‍💻',
      inputs: [
        { name: 'title', type: 'String', description: 'The title of the Buganizer issue.' },
        { name: 'description', type: 'String', description: 'The issue description, can be sourced from another stage.' },
        { name: 'priority', type: 'Int', description: 'Priority of the issue (e.g., 1, 2, 3).' },
      ], 
      outputs: [
        { name: 'issue_url', type: 'String', description: 'The URL of the newly created issue.' },
        { name: 'issue_id', type: 'String', description: 'The ID of the newly created issue.' },
      ]
    },
  ];