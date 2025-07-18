import type { KeywordInstance } from '../../ability/KeywordInstance';
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
    printedUpgradePower?: number;
    printedUpgradeHp?: number;
    printedTraits?: Set<Trait>;
    printedKeywords?: KeywordInstance[];
}

export function getPrintedAttributesOverride<K extends keyof PrintedAttributesOverride>(
    attribute: K,
    overrides: PrintedAttributesOverride[],
): PrintedAttributesOverride[K] | undefined {
    for (let index = overrides.length - 1; index >= 0; index--) {
        if (overrides[index][attribute] != null) {
            return overrides[index][attribute];
        }
    }
    return undefined;
}