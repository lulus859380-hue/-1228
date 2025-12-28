export interface UserInput {
  zodiac: string;
  mbti: string;
  animal: string;
  bloodType: string;
  style: 'descriptive' | 'concise';
}

export interface TraitSection {
  title: string;
  traits: string[];
}

export interface CardData {
  zodiac: TraitSection;
  mbti: TraitSection;
  animal: TraitSection;
  bloodType: TraitSection;
  coreTrait: string;
  fortune: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  userInput: UserInput;
  cardData: CardData;
  viralCopy: string;
}

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}