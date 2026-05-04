import Dexie, { type Table } from 'dexie';

export interface HistoryItem {
  id?: number;
  inputText: string;
  translatedText: string;
  sourceLanguage: string;
  inputType: 'text' | 'voice';
  timestamp: number;
}

export class AppDatabase extends Dexie {
  history!: Table<HistoryItem>;

  constructor() {
    super('GujaratiVaniDB');
    this.version(1).stores({
      history: '++id, timestamp, sourceLanguage'
    });
  }
}

export const db = new AppDatabase();
