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
    MaxDecklistSizeExceeded = 'maxDecklistSizeExceeded',
    MinDecklistSizeNotMet = 'minDecklistSizeNotMet',
    MaxMainboardSizeExceeded = 'maxMainboardSizeExceeded',
    MinMainboardSizeNotMet = 'minMainboardSizeNotMet',
    MaxSideboardSizeExceeded = 'maxSideboardSizeExceeded',
    TooManyCopiesOfCard = 'tooManyCopiesOfCard',
    UnknownCardId = 'unknownCardId'
}

export interface IDeckValidationFailures {
    [DeckValidationFailureReason.NotImplemented]?: ICardIdAndName[];
    [DeckValidationFailureReason.IllegalInFormat]?: ICardIdAndName[];
    [DeckValidationFailureReason.TooManyLeaders]?: boolean;
    [DeckValidationFailureReason.InvalidDeckData]?: boolean;
    [DeckValidationFailureReason.MaxDecklistSizeExceeded]?: { maxDecklistSize: number; actualDecklistSize: number };
    [DeckValidationFailureReason.MinDecklistSizeNotMet]?: { minDecklistSize: number; actualDecklistSize: number };
    [DeckValidationFailureReason.MaxMainboardSizeExceeded]?: { maxBoardedSize: number; actualBoardedSize: number };
    [DeckValidationFailureReason.MinMainboardSizeNotMet]?: { minBoardedSize: number; actualBoardedSize: number };
    [DeckValidationFailureReason.TooManyCopiesOfCard]?: { card: ICardIdAndName; maxCopies: number; actualCopies: number }[];
    [DeckValidationFailureReason.UnknownCardId]?: { id: string }[];
}

export interface ICardValidationFailures {
    notImplemented?: boolean;
    illegalInFormat?: boolean;
}
