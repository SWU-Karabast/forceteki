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
    secondLeader?: GameObjectId<ILeaderCard>;
    allCards: GameObjectId<Card>[];
}

export interface ICardIdAndName {
    /** SWUDB calls this an "id" but it's a setcode */
    id: string;
    name: string;
}

export enum IllegalInFormatReason {
    /** Card's set is not part of the legal rotation for this format (e.g. a SOR card in Premier). */
    RotatedOut = 'rotatedOut',
    /** Card is from a set that has not yet been officially released (or whose set code is unrecognized). */
    Unreleased = 'unreleased',
    /** Card is on this format's suspension list. */
    Suspended = 'suspended',
}

export interface IIllegalCardEntry extends ICardIdAndName {
    reason: IllegalInFormatReason;
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
    /**
     * One or more cards are not legal to play in this format. Each entry carries an `IllegalInFormatReason`
     * indicating why: `RotatedOut` (set outside the current rotation), `Unreleased` (set not yet officially
     * released or whose set code is unrecognized), or `Suspended` (card is on this format's suspension list).
     */
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
    /** Cards that cannot be played in this format. Each entry's `reason` field distinguishes between `RotatedOut`, `Unreleased`, and `Suspended`. */
    [DeckValidationFailureReason.IllegalInFormat]?: IIllegalCardEntry[];
    /** The deck object itself is malformed — null, missing required fields, or contains a negative card count. */
    [DeckValidationFailureReason.InvalidDeckData]?: boolean;
    /** Cards found in the wrong zone (e.g. a leader in the main deck, or a non-leader in the leader slot). Includes the offending card and the zone it was placed in. */
    [DeckValidationFailureReason.InvalidDecklistLocation]?: { card: ICardIdAndName; location: DecklistLocation }[];
    /** The sideboard exceeds the format maximum. Includes both the limit and the actual count. */
    [DeckValidationFailureReason.MaxSideboardSizeExceeded]?: { maxSideboardSize: number; actualSideboardSize: number };
    /** The combined card count (main deck + sideboard) is below the format minimum. Includes both the minimum and the actual count. */
    [DeckValidationFailureReason.MinDecklistSizeNotMet]?: { minDecklistSize: number; actualDecklistSize: number };
    /** The main deck alone is below the format minimum even though the sideboard brings the combined total up to it. Includes both the minimum and the actual boarded count. */
    [DeckValidationFailureReason.MinMainboardSizeNotMet]?: { minBoardedSize: number; actualBoardedSize: number };
    /** Twin Suns only: the deck has a primary leader but no secondary leader. */
    [DeckValidationFailureReason.MissingSecondLeader]?: boolean;
    /** Twin Suns only: one leader has the Heroism aspect and the other has Villainy — an illegal pairing. */
    [DeckValidationFailureReason.MixedAlignmentLeaders]?: boolean;
    /** One or more cards exceed the per-card copy limit for this format. Each entry includes the card, the limit, and the actual count. */
    [DeckValidationFailureReason.TooManyCopiesOfCard]?: { card: ICardIdAndName; maxCopies: number; actualCopies: number }[];
    /** SWUDB import only: a `secondleader` field was present in a deck submitted for a non-FauxSuns format. */
    [DeckValidationFailureReason.TooManyLeaders]?: boolean;
    /** A card's set code could not be found in the card database. Includes the unrecognized set code. */
    [DeckValidationFailureReason.UnknownCardId]?: { id: string }[];
}
