import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { Aspect, Conjunction, RelativePlayer } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class PuttingATeamTogether extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4634587022',
            internalName: 'putting-a-team-together',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: TextHelper.performReplacements(`Search the top 8 cards of your deck for a ${TextHelper.aspectList([Aspect.Vigilance, Aspect.Aggression, Aspect.Cunning], Conjunction.Or)} unit, reveal it, and draw it`),
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 8,
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect([Aspect.Vigilance, Aspect.Aggression, Aspect.Cunning]),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.revealAndDraw({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })
            })
        });
    }
}