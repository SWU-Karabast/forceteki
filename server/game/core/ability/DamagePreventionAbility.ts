import { DamagePreventionSystem } from '../../gameSystems/DamagePreventionSystem';
import type { IDamagePreventionAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import * as EnumHelpers from '../utils/EnumHelpers';
import ReplacementAbilityBase from './ReplacementAbilityBase';

export default class DamagePreventionAbility extends ReplacementAbilityBase {
    public constructor(game: Game, card: Card, properties: IDamagePreventionAbilityProps) {
        const { onlyIfYouDoEffect, ...otherProps } = properties;
        let triggeredAbilityProps: ITriggeredAbilityProps;

        if (onlyIfYouDoEffect) {
            triggeredAbilityProps = {
                ...otherProps,
                immediateEffect: onlyIfYouDoEffect,
                when: { onDamageDealt: (event, context) => this.buildDamagePreventionTrigger(event, context, properties) },
                ifYouDo: {
                    title: 'Replace Effect',
                    ifYouDoCondition: (context) => context.event.card === context.source && (context.event.isUnpreventable !== true),
                    immediateEffect: new DamagePreventionSystem(otherProps)
                }
            };
        } else {
            triggeredAbilityProps = {
                ...otherProps,
                when: { onDamageDealt: (event, context) => this.buildDamagePreventionTrigger(event, context, properties) },
                immediateEffect: new DamagePreventionSystem(otherProps)
            };
        }

        super(game, card, triggeredAbilityProps);
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

        if (properties.onlyIfYouDoEffect == null) {
            if (event.isUnpreventable) {
                return false;
            }
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
