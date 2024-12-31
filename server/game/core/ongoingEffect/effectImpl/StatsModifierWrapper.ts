import type { Card } from '../../card/Card';
import type { CardType } from '../../Constants';
import type { IOngoingCardEffect } from '../IOngoingCardEffect';
import type { StatsModifier } from './StatsModifier';
import * as Contract from '../../utils/Contract';

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
        Contract.assertHasProperty(card, 'printedHp');
        Contract.assertHasProperty(card, 'printedPower');

        const description = card.isUpgrade() ? `${card.name} bonus` : `${card.name} base`;

        return new this({
            hp: card.printedHp,
            power: card.printedPower
        },
        description,
        overrides,
        this.getCardType(card)
        );
    }
}
