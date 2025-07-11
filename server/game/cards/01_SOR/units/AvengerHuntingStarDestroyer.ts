import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AvengerHuntingStarDestroyer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8240629990',
            internalName: 'avenger#hunting-star-destroyer'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Opponent chooses a non-leader unit they control to defeat',
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            targetResolver: {
                activePromptTitle: 'Choose a non-leader unit to defeat',
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}
