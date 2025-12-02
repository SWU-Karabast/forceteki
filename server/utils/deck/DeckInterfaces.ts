import type { IBaseCard } from '../../game/core/card/BaseCard';
import type { IPlayableCard } from '../../game/core/card/baseClasses/PlayableOrDeployableCard';
import type { Card } from '../../game/core/card/Card';
import type { ILeaderCard } from '../../game/core/card/propertyMixins/LeaderProperties';
import type { ITokenCard } from '../../game/core/card/propertyMixins/Token';
import type { SwuGameFormat } from '../../game/core/Constants';
import type { GameObjectRef } from '../../game/core/GameObjectBase';

export interface ISwuDbFormatCardEntry {
    id: string;
    count: number;
}

export interface IInternalCardEntry extends ISwuDbFormatCardEntry {
    internalName: string;
    cost?: number;
}

export enum ScoreType {
    Draw = 'Draw',
    Win = 'Win',
    Lose = 'Lose'
}

export enum DeckSource {
    SWUStats = 'swuStats',
    SWUDB = 'swuDb',
    SWUnlimitedDB = 'swUnlimitedDb',
    SWUBase = 'swuBase',
    SWUCardHub = 'swuCardHub',
    Unknown = 'unknown'
}

export interface IDeckListBase {
    deckID?: string;
    deckLink?: string;
    isPresentInDb?: boolean;
}

export interface ISwuDbFormatDecklist extends IDeckListBase {
    metadata: {
        name: string;
        author: string;
    };
    leader?: ISwuDbFormatCardEntry;
    secondleader?: ISwuDbFormatCardEntry;
    base?: ISwuDbFormatCardEntry;
    deck?: ISwuDbFormatCardEntry[];
    sideboard?: ISwuDbFormatCardEntry[];
}

export interface ILeaderBaseInternal {
    leader: IInternalCardEntry;
    base: IInternalCardEntry;
}

export type IDecklistInternal = ILeaderBaseInternal & IDeckListBase & {
    deck: IInternalCardEntry[];
    sideboard?: IInternalCardEntry[];
};

export interface IDeckListForLoading {
    deckCards: GameObjectRef<IPlayableCard>[];
    outOfPlayCards: any[];
    outsideTheGameCards: GameObjectRef<Card>[];
    tokens: GameObjectRef<ITokenCard>[];
    base: GameObjectRef<IBaseCard> | undefined;
    leader: GameObjectRef<ILeaderCard> | undefined;
    allCards: GameObjectRef<Card>[];
}

export interface ICardIdAndName {

    /** SWUDB calls this an "id" but it's a setcode */
    id: string;
    name: string;
}

export interface IDeckValidationProperties {
    format: SwuGameFormat;
    allow30CardsInMainBoard: boolean;
}

export enum DecklistLocation {
    Leader = 'leader',
    Base = 'base',
    Deck = 'deck'
}

export enum DeckValidationFailureReason {
    IllegalInFormat = 'illegalInFormat',
    TooManyLeaders = 'tooManyLeaders',
    InvalidDecklistLocation = 'invalidCardLocation',
    InvalidDeckData = 'invalidDeckData',
    MinDecklistSizeNotMet = 'minDecklistSizeNotMet',
    MinMainboardSizeNotMet = 'minMainboardSizeNotMet',
    MaxSideboardSizeExceeded = 'maxSideboardSizeExceeded',
    TooManyCopiesOfCard = 'tooManyCopiesOfCard',
    UnknownCardId = 'unknownCardId'
}

export interface IDeckValidationFailures {
    [DeckValidationFailureReason.IllegalInFormat]?: ICardIdAndName[];
    [DeckValidationFailureReason.TooManyLeaders]?: boolean;
    [DeckValidationFailureReason.InvalidDecklistLocation]?: { card: ICardIdAndName; location: DecklistLocation }[];
    [DeckValidationFailureReason.InvalidDeckData]?: boolean;
    [DeckValidationFailureReason.MinDecklistSizeNotMet]?: { minDecklistSize: number; actualDecklistSize: number };
    [DeckValidationFailureReason.MinMainboardSizeNotMet]?: { minBoardedSize: number; actualBoardedSize: number };
    [DeckValidationFailureReason.TooManyCopiesOfCard]?: { card: ICardIdAndName; maxCopies: number; actualCopies: number }[];
    [DeckValidationFailureReason.UnknownCardId]?: { id: string }[];
}
