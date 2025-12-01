export enum RegisteredCosmeticType {
    Cardback = 'cardback',
    Background = 'background',
}

export interface IRegisteredCosmeticOption {
    id: string;
    title: string;
    type: RegisteredCosmeticType;
    path: string;
    darkened?: boolean;
}
