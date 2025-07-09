import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class DagoyanMaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1708605474',
            internalName: 'dagoyan-master'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Use the Force. If you do, search the top 5 cards of your deck for a Force unit, reveal it, and draw it',
            optional: true,
            when: {
                whenPlayed: true,
                whenDefeated: true
            },
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Search the top 5 cards of your deck for a Force unit, reveal it, and draw it',
                immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    selectCount: 1,
                    searchCount: 5,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Force) && card.isUnit(),
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
                })
            }
        });
    }
}
