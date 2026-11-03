import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class SawGerreraForTheCause extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'saw-gerrera#for-the-cause-id',
            internalName: 'saw-gerrera#for-the-cause',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Double another friendly unit\'s power for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: abilityHelper.ongoingEffects.modifyStats({
                        power: context.target.getPower(),
                        hp: 0
                    })
                }))
            }
        });
    }
}
