import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Commission extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1141018768',
            internalName: 'commission'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Search the top 10 cards for a ${TextHelper.Trait.BountyHunter}, ${TextHelper.Trait.Item}, or ${TextHelper.Trait.Transport} card, reveal it, and draw it`,
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                activePromptTitle: `Select a ${TextHelper.Trait.BountyHunter}, ${TextHelper.Trait.Item}, or ${TextHelper.Trait.Transport} card to reveal and draw`,
                searchCount: 10,
                cardCondition: (card) => card.hasSomeTrait([Trait.BountyHunter, Trait.Item, Trait.Transport]),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.revealAndDraw({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })
            })
        });
    }
}
