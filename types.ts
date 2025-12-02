export enum WordStatus {
  UNHEARD = 'UNHEARD',
  HEARD = 'HEARD',
}

export interface WordItem {
  id: string;
  text: string;
  status: WordStatus;
  isLoading: boolean;
  audioBuffer: AudioBuffer | null;
}