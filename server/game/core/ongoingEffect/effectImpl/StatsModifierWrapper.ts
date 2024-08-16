import Card from '../../card/Card';
import type { CardType } from '../../Constants';
import OngoingEffect from '../OngoingEffect';
import { IOngoingCardEffect } from '../IOngoingCardEffect';
import StatsModifier from './StatsModifier';

export default class StatsModifierWrapper {
    modifier: StatsModifier;
    name: string;
    type: CardType;
    overrides: boolean;

    constructor(modifier: StatsModifier, name: string, overrides: boolean, type: CardType) {
        this.modifier = modifier;
        this.name = name;
        this.overrides = overrides;
        this.type = type;
    }

    static getEffectName(effect) {
        if (effect && effect.context && effect.context.source) {
            return effect.context.source.name;
        }
        return 'Unknown';
    }

    static getEffectType(effect) {
        if (effect && effect.context && effect.context.source) {
            return effect.context.source.type;
        }
        return;
    }

    static getCardType(card) {
        if (card) {
            return card.type;
        }
        return;
    }

    static fromEffect(effect: IOngoingCardEffect, card: Card, overrides = false, name = `${this.getEffectName(effect)}`) {
        const modifier = effect.getValue(card) as StatsModifier;

        return new this(
            modifier,
            name,
            overrides,
            this.getEffectType(effect)
        );
    }

    static fromPrintedValues(card: Card, name, overrides = false) {
        return new this({
            hp: card.printedHp,
            power: card.printedPower
        },
        name,
        overrides,
        this.getCardType(card)
        );
    }

    // TODO UPGRADE: should we use this for generating stat modifiers from attached upgrades or use the effect system?
    // static fromStatusToken(amount: number, name, overrides = false) {
    //     return new this(
    //         amount,
    //         name,
    //         overrides,
    //         undefined
    //     );
    // }
}
