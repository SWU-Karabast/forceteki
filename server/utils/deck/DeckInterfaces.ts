export interface ISwuDbCardEntry {
    id: string;
    count: number;
}

export interface ISwuDbDecklist {
    metadata: {
        name: string;
        author: string;
    };
    leader?: ISwuDbCardEntry;
    secondleader?: ISwuDbCardEntry;
    base?: ISwuDbCardEntry;
    deck?: ISwuDbCardEntry[];
    sideboard?: ISwuDbCardEntry[];
}

export interface IDecklistInternal {
    leader: ISwuDbCardEntry;
    base: ISwuDbCardEntry;
    deck: ISwuDbCardEntry[];
    sideboard?: ISwuDbCardEntry[];
}

export interface ICardIdAndName {

    /** SWUDB calls this an "id" but it's a setcode */
    id: string;
    name: string;
}
