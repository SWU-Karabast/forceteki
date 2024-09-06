import { Card } from '../../card/Card';
import { CardWithPrintedHp, CardWithPrintedPower, UnitCard } from '../../card/CardTypes';
import type { CardType } from '../../Constants';
import OngoingEffect from '../OngoingEffect';
import { IOngoingCardEffect } from '../IOngoingCardEffect';
import { StatsModifier } from './StatsModifier';
import { LeaderUnitCard } from '../../card/LeaderUnitCard';
import { NonLeaderUnitCard } from '../../card/NonLeaderUnitCard';
import { UnitPropertiesCard } from '../../card/propertyMixins/UnitProperties';
import Contract from '../../utils/Contract';

/**
 * A wrapper around a {@link StatsModifier} that has helper methods for creation as well
 * as additional logging data intended to facilitate displaying stats in the UI
 */
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
        if (
            !Contract.assertHasProperty(card, 'printedHp') ||
            !Contract.assertHasProperty(card, 'printedPower')
        ) {
            return null;
        }

        const description = card.isUpgrade() ? `${card.name} bonus` : `${card.name} base`;

        return new this({
            hp: (card as CardWithPrintedHp).printedHp,
            power: (card as CardWithPrintedPower).printedPower
        },
        description,
        overrides,
        this.getCardType(card)
        );
    }
}
