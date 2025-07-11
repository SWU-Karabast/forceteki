import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import AbilityHelper from '../../../AbilityHelper';
import { TargetMode, Trait } from '../../../core/Constants';

export default class FollowingThePath extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4387584779',
            internalName: 'following-the-path'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Search the top 8 cards for up to 2 Force units, reveal them, and put them on top of your deck in any order',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                targetMode: TargetMode.UpTo,
                selectCount: 2,
                searchCount: 8,
                cardCondition: (card) => card.hasSomeTrait(Trait.Force) && card.isUnit(),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.revealAndChooseOption({
                    perCardButtons: [
                        {
                            text: 'Put on top',
                            arg: 'top',
                            immediateEffect: AbilityHelper.immediateEffects.moveToTopOfDeck({})
                        },
                    ]
                }),
            })
        });
    }
}