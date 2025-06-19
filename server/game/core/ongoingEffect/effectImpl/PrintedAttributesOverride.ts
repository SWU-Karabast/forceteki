import type { Arena, Aspect, CardType, Trait } from '../../Constants';

export interface PrintedAttributesOverride {
    title?: string;
    subtitle?: string;
    aspects?: Aspect[];
    defaultArena?: Arena;
    printedType?: CardType;
    printedCost?: number;
    printedPower?: number;
    printedHp?: number;
    printedTraits?: Set<Trait>;
}