import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class MillenniumFalconDodgingPatrols extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'millennium-falcon#dodging-patrols-id',
            internalName: 'millennium-falcon#dodging-patrols',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give a space unit -2/-0 for this phase. Give a ground unit +2/+0 for this phase',
            targetResolvers: {
                spaceTarget: {
                    optional: true,
                    activePromptTitle: 'Give a space unit -2/-0 for this phase',
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.SpaceArena,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -0 }),
                    })
                },
                groundTarget: {
                    optional: true,
                    activePromptTitle: 'Give a ground unit +2/+0 for this phase',
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    })
                }
            }
        });
    }
}