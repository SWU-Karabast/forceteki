import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class BosskJoinOurMerryBand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3310848830',
            internalName: 'bossk#join-our-merry-band'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give a unit +1/+1 for this phase and you may give a unit -1/-1 for this phase',
            targetResolvers: {
                buffedUnit: {
                    activePromptTitle: 'Choose a unit to give +1/+1 to for this phase',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
                    }),
                },
                debuffedUnit: {
                    optional: true,
                    activePromptTitle: 'Choose a unit to give -1/-1 to for this phase',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 }),
                    }),
                }
            }
        });
    }
}