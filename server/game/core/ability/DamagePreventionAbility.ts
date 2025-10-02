import type { IDamagePreventionAbilityProps, IReplacementEffectAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import { DamagePreventionSystem } from '../../gameSystems/DamagePreventionSystem';
import { AbilityType, RelativePlayer } from '../Constants';
import TriggeredAbility from './TriggeredAbility';

export default class DamagePreventionAbility extends TriggeredAbility {
    public constructor(game: Game, card: Card, properties: IDamagePreventionAbilityProps) {
        const { replaceWith: cancelProps, ...otherProps } = properties;
        const replacementAbilityProps: IReplacementEffectAbilityProps =
            Object.assign(otherProps, { immediateEffect: new DamagePreventionSystem(properties),
                when: { onDamageDealt: (event, context) => this.buildDamagePreventionTrigger(event, context, properties) } });

        super(game, card, replacementAbilityProps, AbilityType.ReplacementEffect);
    }

    // TODO: Ideally this would go in the system I think, but I'm not sure if we can do that given that we need to have this in the 'when'
    private buildDamagePreventionTrigger(event, context, properties: IDamagePreventionAbilityProps): boolean {
        if (event.card !== context.source) {
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

        // TODO: clean this up with some sort of EnumHelper
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
