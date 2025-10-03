import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class VaneeILiveToServe extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0398004943',
            internalName: 'vanee#i-live-to-serve'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat an Experience token on a friendly unit. If you do, give an Experience token to a friendly unit.',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => card.isExperience() && card.parentCard?.controller === context.player,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: {
                title: 'Give an Experience token to a friendly unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                }
            }
        });
    }
}