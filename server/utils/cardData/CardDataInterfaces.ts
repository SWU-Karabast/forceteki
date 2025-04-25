export interface ICardMapEntry {
    id: string;
    title: string;
    subtitle?: string;
    internalName: string;
    cost?: number;
}

export type ICardMapJson = ICardMapEntry[];
export type ICardMap = Map<string, ICardMapEntry>;

export interface ISetCode {
    set: string;
    number: number;
}

export interface ICardDataJson {
    title: string;
    backSideTitle?: string;
    subtitle?: string;
    cost?: number;
    hp?: number;
    upgradeHp?: number;
    power?: number;
    upgradePower?: number;
    text?: string;
    pilotText?: string;
    deployBox?: string;
    epicAction?: string;
    unique: boolean;
    rules?: string;
    id: string;
    aspects: string[];
    backSideAspects?: string[];
    traits: string[];
    arena?: string;
    keywords?: string[];
    types: string[];
    setId: ISetCode;
    internalName: string;
}
