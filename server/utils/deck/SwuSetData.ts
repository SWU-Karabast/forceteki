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
            { id: SwuSetId.ASH, released: false, mainline: true }
        ]
    },
];

export const nonRotatingSets: INonRotatingSet[] = [
    {
        id: SwuSetId.TS26,
        legalFormats: new Set([SwuGameFormat.Eternal]),
        released: false,
        mainline: false
    },
];

export interface IFormatRules {
    minDeckSize: number;
    maxCardCopies?: number;
    bannedCards: Map<string, string>;
    rotationBlockCount?: number;
}

const bannedPremierCards = new Map([
    ['4626028465', 'boba-fett#collecting-the-bounty'],
    ['4002861992', 'dj#blatant-thief'],
    ['5696041568', 'triple-dark-raid'],
    ['9155536481', 'jango-fett#concealing-the-conspiracy'],
    ['1705806419', 'force-throw']
]);

export const formatRules = new Map<SwuGameFormat, IFormatRules>([
    [SwuGameFormat.Premier, { minDeckSize: 50, maxCardCopies: 3, rotationBlockCount: 2, bannedCards: bannedPremierCards }],
    [SwuGameFormat.Eternal, { minDeckSize: 50, maxCardCopies: 3, bannedCards: new Map() }],
    [SwuGameFormat.Open, { minDeckSize: 50, maxCardCopies: 3, bannedCards: new Map() }],
    [SwuGameFormat.Limited, { minDeckSize: 30, bannedCards: new Map() }],
]);