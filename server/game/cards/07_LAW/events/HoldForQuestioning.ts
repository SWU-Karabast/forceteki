import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class HoldForQuestioning extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'hold-for-questioning-id',
            internalName: 'hold-for-questioning',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust an enemy unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: {
                title: 'Look at its controller\'s hand and discard a card from it that shares an aspect with that unit',
                ifYouDoCondition: (context) => context.player.opponent.hand.length > 0,   // skip ability if opponent has no cards in hand
                immediateEffect: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                    target: context.player.opponent.hand,
                    useDisplayPrompt: true,
                    canChooseFewer: false,
                    immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
                    cardCondition: (card) => context.target.hasSomeAspect([...card.aspects]),
                })),
            }
        });
    }
}