import type { IDamagePreventionAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import { DamagePreventionSystem } from '../../gameSystems/DamagePreventionSystem';
import { AbilityType } from '../Constants';
import TriggeredAbility from './TriggeredAbility';
import * as EnumHelpers from '../utils/EnumHelpers';

export default class DamagePreventionAbility extends TriggeredAbility {
    public constructor(game: Game, card: Card, properties: IDamagePreventionAbilityProps) {
        const triggeredAbilityProps: ITriggeredAbilityProps = {
            ...properties,
            immediateEffect: new DamagePreventionSystem(properties),
            when: { onDamageDealt: (event, context) => this.buildDamagePreventionTrigger(event, context, properties) }
        };

        super(game, card, triggeredAbilityProps, AbilityType.ReplacementEffect);
    }

    private buildDamagePreventionTrigger(event, context, properties: IDamagePreventionAbilityProps): boolean {
        // If a cardPreventionCondition is provided, this means the damage prevention should apply to the card that meets that condition instead of context.source
        if (properties.cardPreventionCondition) {
            if (properties.cardPreventionCondition(event.card, context) === false) {
                return false;
            }
        } else if (event.card !== context.source) {
            return false;
        }

        if (event.isUnpreventable) {
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
