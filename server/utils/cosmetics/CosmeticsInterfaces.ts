export enum CosmeticType {
    Cardback = 'cardback',
    Background = 'background',
    Playmat = 'playmat'
}

export interface CosmeticOption {
    id: string;
    title: string;
    type: CosmeticType;
    path: string;
    darkened?: boolean; // Only applicable for backgrounds
}

export interface Cosmetics {
    cardbacks: CosmeticOption[];
    backgrounds: CosmeticOption[];
    playmats: CosmeticOption[];
}

