import type { IBaseCard } from '../../game/core/card/BaseCard';
import type { IPlayableCard } from '../../game/core/card/baseClasses/PlayableOrDeployableCard';
import type { Card } from '../../game/core/card/Card';
import type { ILeaderCard } from '../../game/core/card/propertyMixins/LeaderProperties';
import type { ITokenCard } from '../../game/core/card/propertyMixins/Token';
import type { GameObjectRef } from '../../game/core/GameObjectBase';

export interface ISwuDbCardEntry {
    id: string;
    count: number;
}

export interface IInternalCardEntry extends ISwuDbCardEntry {
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

export interface DeckSummary {
    deckID: string;
    deckLink?: string;
    deckSource?: DeckSource;
    leaderID: string;
    baseID: string;
    deck: IDecklistInternal;
    isDeckPresentInDb?: boolean;
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
    deckID?: string;
}

export interface ILeaderBaseInternal {
    leader: IInternalCardEntry;
    base: IInternalCardEntry;
}

export interface IDecklistInternal extends ILeaderBaseInternal {
    deck: IInternalCardEntry[];
    sideboard?: IInternalCardEntry[];
    deckID?: string;
    deckLink?: string;
    isPresentInDb?: boolean;
}

export interface IDeckListForLoading {
    deckCards: GameObjectRef<IPlayableCard>[];
    outOfPlayCards: any[];
    outsideTheGameCards: GameObjectRef<Card>[];
    tokens: GameObjectRef<ITokenCard>[];
    base: GameObjectRef<IBaseCard> | undefined;
    leader: GameObjectRef<ILeaderCard> | undefined;
    allCards: GameObjectRef<Card>[];
}

export enum DeckListType {
    Swudb = 'swudb',
    Internal = 'internal'
}

export interface ISwudbDeckListWithType extends ISwuDbDecklist {
    type: DeckListType.Swudb;
}

export interface IInternalDeckListWithType extends IDecklistInternal {
    type: DeckListType.Internal;
}

export type IDeckListWithType = ISwudbDeckListWithType | IInternalDeckListWithType;

export interface ICardIdAndName {

    /** SWUDB calls this an "id" but it's a setcode */
    id: string;
    name: string;
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
