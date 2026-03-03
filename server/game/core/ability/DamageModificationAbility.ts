import { DamageModificationSystem } from '../../gameSystems/DamageModificationSystem';
import type { IDamageModificationAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import * as EnumHelpers from '../utils/EnumHelpers';
import ReplacementAbilityBase from './ReplacementAbilityBase';
import { registerState } from '../GameObjectUtils';

@registerState()
export default class DamageModificationAbility extends ReplacementAbilityBase {
    public constructor(game: Game, card: Card, properties: IDamageModificationAbilityProps) {
        const { onlyIfYouDoEffect, ...otherProps } = properties;

        super(game, card, properties, new DamageModificationSystem(otherProps),
            { onDamageDealt: (event, context) => this.buildDamageModificationTrigger(event, context, properties) });
    }

    private buildDamageModificationTrigger(event, context, properties: IDamageModificationAbilityProps): boolean {
        // If a cardModificationCondition is provided, this means the damage modification should apply to the card that meets that condition instead of context.source
        if (properties.shouldCardHaveDamageModification) {
            if (properties.shouldCardHaveDamageModification(event.card, context) === false) {
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
