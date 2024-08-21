import { Card } from '../../card/Card';
import { UnitCard } from '../../card/CardTypes';
import type { CardType } from '../../Constants';
import OngoingEffect from '../OngoingEffect';
import { IOngoingCardEffect } from '../IOngoingCardEffect';
import StatsModifier from './StatsModifier';
import { LeaderUnitCard } from '../../card/LeaderUnitCard';
import { NonLeaderUnitCard } from '../../card/NonLeaderUnitCard';
import { UnitPropertiesCard } from '../../card/propertyMixins/UnitProperties';
import Contract from '../../utils/Contract';

export default class StatsModifierWrapper {
    public readonly modifier: StatsModifier;
    public readonly name: string;
    public readonly type: CardType;
    public readonly overrides: boolean;

    public constructor(modifier: StatsModifier, name: string, overrides: boolean, type: CardType) {
        this.modifier = modifier;
        this.name = name;
        this.overrides = overrides;
        this.type = type;
    }

    public static getEffectName(effect) {
        if (effect && effect.context && effect.context.source) {
            return effect.context.source.name;
        }
        return 'Unknown';
    }

    public static getEffectType(effect) {
        if (effect && effect.context && effect.context.source) {
            return effect.context.source.type;
        }
        return;
    }

    public static getCardType(card) {
        if (card) {
            return card.type;
        }
        return;
    }

    public static fromEffect(effect: IOngoingCardEffect, card: Card, overrides = false, name = `${this.getEffectName(effect)}`) {
        const modifier = effect.getValue(card) as StatsModifier;

        return new this(
            modifier,
            name,
            overrides,
            this.getEffectType(effect)
        );
    }

    public static fromPrintedValues(card: Card, overrides = false) {
        if (!Contract.assertTrue(card.isUnit())) {
            return null;
        }

        return new this({
            hp: (card as UnitCard).printedHp,
            power: (card as UnitCard).printedPower
        },
        `${card.name} base`,
        overrides,
        this.getCardType(card)
        );
    }

    // TODO UPGRADES: should we use this for generating stat modifiers from attached upgrades or use the effect system?
    // static fromStatusToken(amount: number, name, overrides = false) {
    //     return new this(
    //         amount,
    //         name,
    //         overrides,
    //         undefined
    //     );
    // }
}
