import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class NeelTheCutestBoy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8371755043',
            internalName: 'neel#the-cutest-boy',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'The next unit you play this phase with 1 or less power enters play ready',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.entersPlayReadyMatching({
                    cardTypeFilter: WildcardCardType.Unit,
                    limit: AbilityHelper.limit.perPlayerPerGame(1),
                    match: (card) => card.isUnit() && card.getPrintedPower() <= 1,
                })
            })
        });
    }
}
