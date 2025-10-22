import { DamagePreventionSystem } from '../../gameSystems/DamagePreventionSystem';
import type { IDamagePreventionAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import * as EnumHelpers from '../utils/EnumHelpers';
import ReplacementAbilityBase from './ReplacementAbilityBase';

export default class DamagePreventionAbility extends ReplacementAbilityBase {
    public constructor(game: Game, card: Card, properties: IDamagePreventionAbilityProps) {
        const { onlyIfYouDoEffect, ...otherProps } = properties;

        super(game, card, properties, new DamagePreventionSystem(otherProps), { onDamageDealt: (event, context) => this.buildDamagePreventionTrigger(event, context, properties) });
    }

    private buildDamagePreventionTrigger(event, context, properties: IDamagePreventionAbilityProps): boolean {
        // If a cardPreventionCondition is provided, this means the damage prevention should apply to the card that meets that condition instead of context.source
        if (properties.shouldCardHaveDamagePrevention) {
            if (properties.shouldCardHaveDamagePrevention(event.card, context) === false) {
                return false;
            }
        } else if (event.card !== context.source) {
            return false;
        }

        if (properties.damageOfType && event.damageSource.type !== properties.damageOfType) {
            return false;
        }

        if (properties.onlyFromPlayer) {
            return EnumHelpers.asConcretePlayer(properties.onlyFromPlayer, context.source.controller) === event.damageSource.player;
        }

        return true;
    }
}
