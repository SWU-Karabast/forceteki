import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { BaseCard } from '../../../core/card/BaseCard';
import { DamageType } from '../../../core/Constants';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TempleOfDestruction extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '9453163990',
            internalName: 'temple-of-destruction',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'The Force is with you',
            when: {
                onDamageDealt: (event, context) => this.dealtThreeBaseDamage(event, context)
            },
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }

    private dealtThreeBaseDamage (event: any, context: AbilityContext) {
        if (event.damageSource.player !== context.player) {
            return false;
        }

        if (!event.card.isBase()) {
            return false;
        }

        if (event.card.controller === context.player) {
            return false;
        }

        if (event.type === DamageType.Combat) {
            return event.amount >= 3;
        } else if (event.type === DamageType.Overwhelm) {
            return event.sourceEventForExcessDamage.availableExcessDamage >= 3;
        }
        return false;
    }
}
