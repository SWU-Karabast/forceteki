import type { Card } from '../../card/Card';
import type { CardType } from '../../Constants';
import type { StatsModifier } from './StatsModifier';
import * as Contract from '../../utils/Contract';
import type { OngoingCardEffect } from '../OngoingCardEffect';

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

    public static getEffectName(effect: OngoingCardEffect) {
        if (effect && effect.context && effect.context.source) {
            return effect.context.source.title;
        }
        return 'Unknown';
    }

    public static getEffectType(effect: OngoingCardEffect): CardType | undefined {
        if (effect && effect.context && effect.context.source) {
            return this.getCardType(effect.context.source);
        }
        return undefined;
    }

    public static getCardType(card: Card) {
        return card.type;
    }

    public static fromEffect(effect: OngoingCardEffect, card: Card, overrides = false, name = `${this.getEffectName(effect)}`) {
        const modifier = effect.getValue(card) as StatsModifier;

        return new this(
            modifier,
            name,
            overrides,
            this.getEffectType(effect) ?? this.getCardType(card)
        );
    }

    public static fromPrintedValues(card: Card, overrides = false) {
        Contract.assertHasProperty(card, 'printedHp');
        Contract.assertHasProperty(card, 'printedPower');

        const description = card.isUpgrade() ? `${card.name} bonus` : `${card.name} base`;

        let hp: number;
        let power: number;
        if (card.isUpgrade()) {
            if (card.printedUpgradeHp == null && card.printedUpgradePower == null) {
                hp = 0;
                power = 0;
            } else {
                Contract.assertTrue(
                    card.printedUpgradeHp != null && card.printedUpgradePower != null,
                    `Found incomplete printed upgrade stats. hp: ${card.printedUpgradeHp}, power: ${card.printedUpgradePower}`
                );

                hp = card.printedUpgradeHp;
                power = card.printedUpgradePower;
            }
        } else {
            hp = card.printedHp;
            power = card.printedPower;
        }

        return new this(
            { hp, power },
            description,
            overrides,
            this.getCardType(card)
        );
    }

    public static statsModifierDescription(modifier: StatsModifier): string {
        const locale: Intl.LocalesArgument = 'en';
        const options: Intl.NumberFormatOptions = {
            signDisplay: 'always',
        };
        // Ensure that we show -0 if one of the values is zero and other is negative (e.g. -2/-0 instead of -2/+0)
        const zero = (modifier.power < 0 && modifier.hp <= 0) || (modifier.power <= 0 && modifier.hp < 0) ? -0 : 0;
        return (modifier.power || zero).toLocaleString(locale, options) + '/' + (modifier.hp || zero).toLocaleString(locale, options);
    }
}
