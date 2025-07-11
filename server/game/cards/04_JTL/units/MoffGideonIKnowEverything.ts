import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, WildcardCardType } from '../../../core/Constants';

export default class MoffGideonIKnowEverything extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7312183744',
            internalName: 'moff-gideon#i-know-everything',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Each unit that opponent plays this phase costs 1 resource more',
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker === context.source &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.getSingleTarget().isBase()) || event.type === DamageType.Overwhelm)
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect((context) => ({
                target: context.player.opponent,
                effect: AbilityHelper.ongoingEffects.increaseCost({
                    cardTypeFilter: WildcardCardType.Unit,
                    amount: 1,
                    limit: AbilityHelper.limit.unlimited()
                })
            })),
        });
    }
}
