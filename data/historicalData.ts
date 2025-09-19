import { Connection } from '../types';

interface HistoricalConnection {
  sourceStageName: string;
  sourceField: string;
  destStageName: string;
  destField: string;
}

interface HistoricalPattern {
  sequence: string[];
  connections: HistoricalConnection[];
}

// This data represents common workflow patterns observed from usage.
export const historicalPatterns: HistoricalPattern[] = [
  {
    // A common pattern: submit a changelist, then update its description.
    sequence: ['SUBMIT_CHANGELIST', 'UPDATE_DESCRIPTION'],
    connections: [
      {
        sourceStageName: 'SUBMIT_CHANGELIST',
        sourceField: 'submitted_revision',
        destStageName: 'UPDATE_DESCRIPTION',
        destField: 'changelist_id',
      },
    ],
  },
  {
    // Another pattern: Build something, then create a bug for it.
    sequence: ['CODEMAKER', 'CREATE_BUGANIZER_ISSUE'],
    connections: [
       {
        sourceStageName: 'CODEMAKER',
        sourceField: 'build_artifact', 
        destStageName: 'CREATE_BUGANIZER_ISSUE',
        destField: 'description',
      },
    ]
  },
  {
      // A more complex example showing a three-stage sequence
      sequence: ['AI Raters', 'Active Union Cells', 'CODEMAKER'],
      connections: [
          {
              sourceStageName: 'AI Raters',
              sourceField: 'model_deployment_config',
              destStageName: 'Active Union Cells',
              destField: 'targets',
          },
          {
              sourceStageName: 'Active Union Cells',
              sourceField: 'cells',
              destStageName: 'CODEMAKER',
              destField: 'build_target',
          }
      ]
  }
];
