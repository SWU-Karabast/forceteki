import type { IDamagePreventionAbilityProps, IReplacementEffectAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import { DamagePreventionSystem } from '../../gameSystems/DamagePreventionSystem';
import { AbilityType, RelativePlayer } from '../Constants';
import TriggeredAbility from './TriggeredAbility';

export default class DamagePreventionAbility extends TriggeredAbility {
    public constructor(game: Game, card: Card, properties: IDamagePreventionAbilityProps) {
        const replacementAbilityProps: IReplacementEffectAbilityProps =
            Object.assign({}, properties, { immediateEffect: new DamagePreventionSystem(properties),
                when: { onDamageDealt: (event, context) => this.buildDamagePreventionTrigger(event, context, properties) } });

        super(game, card, replacementAbilityProps, AbilityType.ReplacementEffect);
    }

    private buildDamagePreventionTrigger(event, context, properties: IDamagePreventionAbilityProps): boolean {
        // If a custom targetCondition is provided, this means the damage prevention should apply to the card that meets that condition instead of context.source
        if (properties.targetCondition) {
            if (properties.targetCondition(event.card, context) === false) {
                return false;
            }
        } else if (event.card !== context.source) {
            return false;
        }

        if (event.isUnpreventable) {
            return false;
        }

        if (properties.preventDamageFrom) {
            if (event.damageSource.type !== properties.preventDamageFrom) {
                return false;
            }
        }

        if (properties.preventDamageFromSource) {
            if (properties.preventDamageFromSource === RelativePlayer.Opponent) {
                return event.damageSource.player !== context.source.controller;
            } else if (properties.preventDamageFromSource === RelativePlayer.Self) {
                return event.damageSource.player === context.source.controller;
            }
        }

        return true;
    }
}
