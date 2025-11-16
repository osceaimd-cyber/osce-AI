
export enum SimulationState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DEBRIEFING = 'DEBRIEFING',
}

export type Scenario = 'UBS' | 'UPA 24h' | 'CTI' | 'SAMU / Corpo de Bombeiros';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
