import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, WildcardCardType } from '../../../core/Constants';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

export default class MoffGideonIKnowEverything extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7312183744',
            internalName: 'moff-gideon#i-know-everything',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Each unit that opponent plays this phase costs 1 resource more',
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker === context.source &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.target?.isBase()) || event.type === DamageType.Overwhelm)
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect((context) => ({
                targetController: context.player.opponent,
                effect: AbilityHelper.ongoingEffects.increaseCost({
                    cardTypeFilter: WildcardCardType.Unit,
                    amount: 1,
                    limit: AbilityLimit.unlimited()
                })
            })),
        });
    }
}
