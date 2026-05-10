import type { IBaseCard } from '../../game/core/card/BaseCard';
import type { IPlayableCard } from '../../game/core/card/baseClasses/PlayableOrDeployableCard';
import type { Card } from '../../game/core/card/Card';
import type { ILeaderCard } from '../../game/core/card/propertyMixins/LeaderProperties';
import type { ITokenCard } from '../../game/core/card/propertyMixins/Token';
import type { GameObjectId } from '../../game/core/GameObjectUtils';
import type { CardPool, SwuGameFormat } from '../../game/core/Constants';

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
    name?: string;
    secondLeader?: IInternalCardEntry;
    deck: IInternalCardEntry[];
    sideboard?: IInternalCardEntry[];
};

export interface IDeckListForLoading {
    deckCards: GameObjectId<IPlayableCard>[];
    outOfPlayCards: any[];
    outsideTheGameCards: GameObjectId<Card>[];
    tokens: GameObjectId<ITokenCard>[];
    base: GameObjectId<IBaseCard> | undefined;
    leader: GameObjectId<ILeaderCard> | undefined;
    allCards: GameObjectId<Card>[];
}

export interface ICardIdAndName {

    /** SWUDB calls this an "id" but it's a setcode */
    id: string;
    name: string;
}

export interface IDeckValidationProperties {
    format: SwuGameFormat;
    cardPool: CardPool;
}

export enum DecklistLocation {
    Leader = 'leader',
    Base = 'base',
    Deck = 'deck'
}

export enum DeckValidationFailureReason {
    /** Card is from a set not legal in this format/card-pool, or is on the format's ban list. */
    IllegalInFormat = 'illegalInFormat',
    /** Deck object is null, missing required fields, or contains a negative card count. */
    InvalidDeckData = 'invalidDeckData',
    /** Card appears in the wrong zone (e.g. a leader in the main deck, or a unit in the leader slot). */
    InvalidDecklistLocation = 'invalidCardLocation',
    /** Sideboard exceeds the format maximum (10 in Premier/Eternal; unrestricted in Open/TwinSuns). */
    MaxSideboardSizeExceeded = 'maxSideboardSizeExceeded',
    /** Total card count (main deck + sideboard) is below the format minimum (50 Premier/Eternal, 80 TwinSuns). */
    MinDecklistSizeNotMet = 'minDecklistSizeNotMet',
    /** Main deck alone is below the format minimum even though the sideboard brings the combined total up to it. */
    MinMainboardSizeNotMet = 'minMainboardSizeNotMet',
    /** TwinSuns only: deck has a primary leader but is missing a secondary leader. */
    MissingSecondLeader = 'missingSecondLeader',
    /** TwinSuns only: one leader has the Heroism aspect and the other has Villainy — an illegal pairing. */
    MixedAlignmentLeaders = 'mixedAlignmentLeaders',
    /** One or more cards exceed the per-card copy limit for this format (3× Premier/Eternal, 1× TwinSuns, with per-card overrides). */
    TooManyCopiesOfCard = 'tooManyCopiesOfCard',
    /** SWUDB import: a secondleader field was present in a non-TwinSuns deck submission. */
    TooManyLeaders = 'tooManyLeaders',
    /** A card's set code was not found in the card database. */
    UnknownCardId = 'unknownCardId',
}

export interface IDeckValidationFailures {
    [DeckValidationFailureReason.IllegalInFormat]?: ICardIdAndName[];
    [DeckValidationFailureReason.InvalidDeckData]?: boolean;
    [DeckValidationFailureReason.InvalidDecklistLocation]?: { card: ICardIdAndName; location: DecklistLocation }[];
    [DeckValidationFailureReason.MaxSideboardSizeExceeded]?: { maxSideboardSize: number; actualSideboardSize: number };
    [DeckValidationFailureReason.MinDecklistSizeNotMet]?: { minDecklistSize: number; actualDecklistSize: number };
    [DeckValidationFailureReason.MinMainboardSizeNotMet]?: { minBoardedSize: number; actualBoardedSize: number };
    [DeckValidationFailureReason.MissingSecondLeader]?: boolean;
    [DeckValidationFailureReason.MixedAlignmentLeaders]?: boolean;
    [DeckValidationFailureReason.TooManyCopiesOfCard]?: { card: ICardIdAndName; maxCopies: number; actualCopies: number }[];
    [DeckValidationFailureReason.TooManyLeaders]?: boolean;
    [DeckValidationFailureReason.UnknownCardId]?: { id: string }[];
}
