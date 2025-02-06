export interface ICardMapEntry {
    id: string;
    title: string;
    subtitle?: string;
    internalName: string;
}

export type ICardMapJson = ICardMapEntry[];
export type ICardMap = Map<string, ICardMapEntry>;

export interface ICardDataJson {
    title: string;
    subtitle?: string;
    cost?: number;
    hp?: number;
    power?: number;
    text?: string;
    deployBox?: string;
    epicAction?: string;
    unique: boolean;
    rules?: string;
    id: string;
    aspects: string[];
    traits: string[];
    arena?: string;
    keywords?: string[];
    types: string[];
    setId: {
        set: string;
        number: number;
    };
    internalName: string;
}
