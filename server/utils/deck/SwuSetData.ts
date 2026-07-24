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
    IC27 = 'ic27'
}

export enum BlockId {
    Zero = '0',
    A = 'A',
    B = 'B'
}

export interface ISwuSet {
    id: SwuSetId;
    released: boolean;
    mainline: boolean;
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
            { id: SwuSetId.SOR, released: true, mainline: true },
            { id: SwuSetId.SHD, released: true, mainline: true },
            { id: SwuSetId.TWI, released: true, mainline: true }
        ]
    },
    {
        id: BlockId.A,
        sets: [
            { id: SwuSetId.JTL, released: true, mainline: true },
            { id: SwuSetId.LOF, released: true, mainline: true },
            { id: SwuSetId.IBH, released: true, mainline: false },
            { id: SwuSetId.SEC, released: true, mainline: true }
        ]
    },
    {
        id: BlockId.B,
        sets: [
            { id: SwuSetId.LAW, released: true, mainline: true },
            { id: SwuSetId.ASH, released: true, mainline: true },
            { id: SwuSetId.IC27, released: false, mainline: false }
        ]
    },
];

export const nonRotatingSets: INonRotatingSet[] = [
    {
        id: SwuSetId.TS26,
        legalFormats: new Set([SwuGameFormat.Eternal, SwuGameFormat.FauxSuns]),
        released: true,
        mainline: false
    },
];

export interface IFormatRules {
    minDeckSize: number;
    maxCardCopies?: number;
    bannedCards: Map<string, string>;
    rotationBlockCount?: number;
    leaderCount: number;
}

const bannedPremierCards = new Map<string, string>();

const bannedEternalCards = new Map([
    ['4203363893', 'war-juggernaut'],
    ['3722493191', 'ig2000#assassins-aggressor'],
]);

export const formatRules = new Map<SwuGameFormat, IFormatRules>([
    [SwuGameFormat.Premier, { minDeckSize: 50, maxCardCopies: 3, rotationBlockCount: 2, bannedCards: bannedPremierCards, leaderCount: 1 }],
    [SwuGameFormat.Eternal, { minDeckSize: 50, maxCardCopies: 3, bannedCards: bannedEternalCards, leaderCount: 1 }],
    [SwuGameFormat.Open, { minDeckSize: 50, maxCardCopies: 3, bannedCards: new Map(), leaderCount: 1 }],
    [SwuGameFormat.Limited, { minDeckSize: 30, bannedCards: new Map(), leaderCount: 1 }],
    [SwuGameFormat.FauxSuns, { minDeckSize: 80, maxCardCopies: 1, bannedCards: new Map(), leaderCount: 2 }],
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
