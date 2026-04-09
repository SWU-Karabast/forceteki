import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class EzraBridgerTheForceIsAllINeed extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ezra-bridger#the-force-is-all-i-need-id',
            internalName: 'ezra-bridger#the-force-is-all-i-need',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Give a unit -3/-0 for the phase',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.isUpgraded(),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Give a unit -3/-0 for the phase',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: 0 })
                    })
                })
            })
        });
    }
}