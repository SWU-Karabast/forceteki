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

export enum DeckValidationFailureReason {
    NotImplemented = 'notImplemented',
    IllegalInFormat = 'illegalInFormat',
    TooManyLeaders = 'tooManyLeaders',
    InvalidDeckData = 'invalidDeckData',
    MaxDeckSizeExceeded = 'deckSizeExceeded',
    MinDeckSizeNotMet = 'minDeckSizeNotMet',
    TooManyCopiesOfCard = 'tooManyCopiesOfCard',
    UnknownCardId = 'unknownCardId'
}

export interface IDeckValidationFailures {
    [DeckValidationFailureReason.NotImplemented]?: ICardIdAndName[];
    [DeckValidationFailureReason.IllegalInFormat]?: ICardIdAndName[];
    [DeckValidationFailureReason.TooManyLeaders]?: boolean;
    [DeckValidationFailureReason.InvalidDeckData]?: boolean;
    [DeckValidationFailureReason.MaxDeckSizeExceeded]?: { maxDeckSize: number; actualDeckSize: number };
    [DeckValidationFailureReason.MinDeckSizeNotMet]?: { minDeckSize: number; actualDeckSize: number };
    [DeckValidationFailureReason.TooManyCopiesOfCard]?: { card: ICardIdAndName; maxCopies: number; actualCopies: number }[];
    [DeckValidationFailureReason.UnknownCardId]?: { id: string }[];
}

export interface ICardValidationFailures {
    notImplemented?: boolean;
    illegalInFormat?: boolean;
}
