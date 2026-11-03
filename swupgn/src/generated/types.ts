// GENERATED from schema/swupgn.schema.json — do not edit

/**
 * A seat: 1 or 2.
 */
export type Seat = 1 | 2;
/**
 * A card, token or effect entity id (a positive integer), or one of the reserved ids g, p1, p2.
 */
export type EntityId = number | ('g' | 'p1' | 'p2');
/**
 * Who knows an identity: everyone, or the listed seats.
 */
export type Audience = 'all' | Seat[];
/**
 * Any JSON value.
 */
export type AttrValue =
    | boolean
    | number
    | string
    | null
    | AttrValue[]
    | {
          [k: string]: AttrValue;
      };
/**
 * Any RECORDS line of a known type.
 */
export type SwuRecord = CreateRecord | SetRecord | RemoveRecord | RevealRecord | StepRecord | BlockRecord;
/**
 * The header tags. Every value is a string; unknown tags are allowed.
 */
export type Header = {[tag: string]: string};

/**
 * Attributes by name. Unknown names are kept.
 */
export interface Attrs {
    [k: string]: AttrValue;
}
export interface CreateRecord {
    t: 'create';
    e: number;
    zone?: string;
    owner: Seat;
    controller?: Seat;
    parent?: EntityId;
    rel?: string;
    card?: string;
    to?: Audience;
    a?: Attrs;
}
export interface SetRecord {
    t: 'set';
    e: EntityId;
    zone?: string;
    owner?: Seat;
    controller?: Seat | null;
    parent?: EntityId | null;
    rel?: string | null;
    a?: Attrs;
}
export interface RemoveRecord {
    t: 'remove';
    e: number;
}
export interface RevealRecord {
    t: 'reveal';
    e: number;
    card: string;
    to: Audience;
}
export interface StepRecord {
    t: 'step';
    seq: number;
    ms?: number;
}
export interface BlockRecord {
    t: 'block';
    id: number;
    kind: string;
    p?: Seat;
    src?: EntityId;
    targets?: EntityId[];
    options?: EntityId[];
    amount?: number;
    parent?: number;
    via?: EntityId;
    group?: number;
    text?: string;
}
/**
 * One DECKS line (design 4.2).
 */
export interface DeckLine {
    p: Seat;
    /**
     * @minItems 1
     */
    leaders: string[];
    base: string;
    complete: boolean;
    main: Array<[string, number] | [string]>;
    sideboard?: Array<[string, number]>;
    order?: string[];
}
/**
 * One CARDS line: the display name of a card id.
 */
export interface CardLine {
    id: string;
    name: string;
    backSideName?: string;
}
/**
 * One ANNOTATIONS line, attached to a step by seq.
 */
export interface Annotation {
    seq: number;
    text?: string;
    nag?: string;
    by?: string;
    id?: string;
    parent?: string;
}
/**
 * An entity on a board: its fixed fields and its attributes.
 */
export interface Entity {
    zone?: string;
    owner?: Seat;
    controller?: Seat;
    parent?: EntityId;
    rel?: string;
    card?: string;
    to?: Audience;
    a: Attrs;
}
/**
 * The board after applying records. Keys of entities are String(EntityId); g, p1 and p2 are always present.
 */
export interface Board {
    seq: number | null;
    entities: {
        [k: string]: Entity;
    };
}
/**
 * A parsed file: the structure parse returns and serialize accepts (not a line schema).
 */
export interface SwuPgnFile {
    header: Header;
    story?: string;
    decks: DeckLine[];
    cards: CardLine[];
    records: SwuRecord[];
    annotations: Annotation[];
    unknownSections: {
        name: string;
        lines: string[];
    }[];
}
