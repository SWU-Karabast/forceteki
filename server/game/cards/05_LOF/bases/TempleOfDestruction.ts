import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { BaseCard } from '../../../core/card/BaseCard';
import { DamageType } from '../../../core/Constants';

export default class TempleOfDestruction extends BaseCard {
    protected override getImplementationId () {
        return {
            id: 'temple-of-destruction-id',
            internalName: 'temple-of-destruction',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
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
