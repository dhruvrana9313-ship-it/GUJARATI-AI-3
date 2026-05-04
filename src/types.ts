export type Screen = 'home' | 'history' | 'settings';

export interface AppState {
  currentScreen: Screen;
  isDarkMode: boolean;
  speechSpeed: number;
}
