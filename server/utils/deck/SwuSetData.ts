import { SwuGameFormat } from '../../game/core/Constants';

export enum SwuSetId {
    SOR = 'sor',
    SHD = 'shd',
    TWI = 'twi',
    JTL = 'jtl',
    LOF = 'lof',
    IBH = 'ibh',
    SEC = 'sec',
    LAW = 'law',
    TS26 = 'ts26',
    ASH = 'ash',
    HMW = 'hmw',
    IC27 = 'ic27'
}

export enum BlockId {
    Zero = '0',
    A = 'A',
    B = 'B'
}

/**
 * Where a set sits in the release timeline. Drives which card pools include it:
 * - `Released`: in play now — legal under the Current pool (and every later pool).
 * - `Next`: the single upcoming set that releases next — added under the NextSet pool so players can
 *   test the post-release meta, but not yet legal under Current.
 * - `Future`: a set previewing further out than `Next` (e.g. a second, overlapping preview season). Not
 *   part of any constructed pool yet — excluded from Current and NextSet alike so a NextSet meta reflects
 *   only the immediately-upcoming set.
 */
export enum ReleaseStage {
    Released = 'released',
    Next = 'next',
    Future = 'future',
}

export interface ISwuSet {
    id: SwuSetId;
    releaseStage: ReleaseStage;
    mainline: boolean;
}

/** True if the set is released and therefore legal under the Current card pool. */
export function isReleased(set: ISwuSet): boolean {
    return set.releaseStage === ReleaseStage.Released;
}

export interface INonRotatingSet extends ISwuSet {
    legalFormats: Set<SwuGameFormat>;
}

export interface IRotationBlock {
    id: BlockId;
    sets: ISwuSet[];
}

export const rotationBlocks: IRotationBlock[] = [
    {
        id: BlockId.Zero,
        sets: [
            { id: SwuSetId.SOR, releaseStage: ReleaseStage.Released, mainline: true },
            { id: SwuSetId.SHD, releaseStage: ReleaseStage.Released, mainline: true },
            { id: SwuSetId.TWI, releaseStage: ReleaseStage.Released, mainline: true }
        ]
    },
    {
        id: BlockId.A,
        sets: [
            { id: SwuSetId.JTL, releaseStage: ReleaseStage.Released, mainline: true },
            { id: SwuSetId.LOF, releaseStage: ReleaseStage.Released, mainline: true },
            { id: SwuSetId.IBH, releaseStage: ReleaseStage.Released, mainline: false },
            { id: SwuSetId.SEC, releaseStage: ReleaseStage.Released, mainline: true }
        ]
    },
    {
        id: BlockId.B,
        sets: [
            { id: SwuSetId.LAW, releaseStage: ReleaseStage.Released, mainline: true },
            { id: SwuSetId.ASH, releaseStage: ReleaseStage.Released, mainline: true },
            // HMW is the next set to release; IC27 previews overlap HMW's preview season but release later, so
            // it stays Future and is excluded from HMW's NextSet meta.
            { id: SwuSetId.HMW, releaseStage: ReleaseStage.Next, mainline: true },
            { id: SwuSetId.IC27, releaseStage: ReleaseStage.Future, mainline: false }
        ]
    },
];

export const nonRotatingSets: INonRotatingSet[] = [
    {
        id: SwuSetId.TS26,
        legalFormats: new Set([SwuGameFormat.Eternal]),
        releaseStage: ReleaseStage.Released,
        mainline: false
    },
];

/**
 * A card suspended in a format. `name` is the card's internal name (also used as a human-readable label).
 * `expiresWith`, if set, lifts the suspension once that set is in the validated card pool — so a ban that
 * the publisher has said ends with a set's release passes under NextSet immediately, and under Current
 * automatically once that set actually releases (its stage flips to Released), with no further code change.
 */
export interface IBannedCard {
    name: string;
    expiresWith?: SwuSetId;
}

export interface IFormatRules {
    minDeckSize: number;
    maxCardCopies?: number;
    bannedCards: Map<string, IBannedCard>;
    rotationBlockCount?: number;
}

const bannedPremierCards = new Map<string, IBannedCard>([
    ['5648009238', { name: 'cad-bane#still-faster-than-you' }]
]);

const bannedEternalCards = new Map<string, IBannedCard>([
    ['4203363893', { name: 'war-juggernaut', expiresWith: SwuSetId.HMW }],
    ['3722493191', { name: 'ig2000#assassins-aggressor', expiresWith: SwuSetId.HMW }],
]);

export const formatRules = new Map<SwuGameFormat, IFormatRules>([
    [SwuGameFormat.Premier, { minDeckSize: 50, maxCardCopies: 3, rotationBlockCount: 2, bannedCards: bannedPremierCards }],
    [SwuGameFormat.Eternal, { minDeckSize: 50, maxCardCopies: 3, bannedCards: bannedEternalCards }],
    [SwuGameFormat.Open, { minDeckSize: 50, maxCardCopies: 3, bannedCards: new Map() }],
    [SwuGameFormat.Limited, { minDeckSize: 30, bannedCards: new Map() }],
]);

/**
 * Bundles the set/format data the {@link DeckValidator} reads when computing legal sets. Production uses
 * {@link defaultSetCatalog}; tests can supply an alternate catalog (e.g. one containing a synthetic preview
 * set) so preview/NextSet behaviour can be exercised deterministically regardless of the real release state.
 */
export interface ISetCatalog {
    rotationBlocks: IRotationBlock[];
    nonRotatingSets: INonRotatingSet[];
    formatRules: Map<SwuGameFormat, IFormatRules>;
}

export const defaultSetCatalog: ISetCatalog = { rotationBlocks, nonRotatingSets, formatRules };