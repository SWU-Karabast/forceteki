export enum RegisteredCosmeticType {
    Cardback = 'cardback',
    Background = 'background',
}

export interface ICosmeticEntity {
    id: string;
    title: string;
    type: RegisteredCosmeticType;
    path: string;
}

export interface IActiveCosmetics {
    cardback: ICosmeticEntity;
    background: ICosmeticEntity;
}
