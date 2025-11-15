export enum RegisteredCosmeticType {
    Cardback = 'cardback',
    Background = 'background',
    Playmat = 'playmat'
}

export interface IRegisteredCosmeticOption {
    id: string;
    title: string;
    type: RegisteredCosmeticType;
    path: string;
    darkened?: boolean;
}
