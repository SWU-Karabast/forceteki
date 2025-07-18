import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class SteelaGerreraBelovedTactician extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8096748603',
            internalName: 'steela-gerrera#beloved-tactician',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to your base. If you do, search the top 8 cards of your deck for a Tactic card, reveal it, and draw it',
            when: {
                whenPlayed: true,
                whenDefeated: true
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.player.base
            })),
            ifYouDo: {
                title: 'Search the top 8 cards of your deck for a Tactic card, reveal it, and draw it',
                immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    searchCount: 8,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Tactic),
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
                })
            }
        });
    }
}

