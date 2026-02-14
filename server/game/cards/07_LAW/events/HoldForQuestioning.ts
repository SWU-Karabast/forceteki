import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class HoldForQuestioning extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'hold-for-questioning-id',
            internalName: 'hold-for-questioning',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust an enemy unit. If you do, look at its controller\'s hand and discard a card from it that shares an aspect with that unit',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.exhaust(),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Look at its controller\'s hand and discard a card from it that shares an aspect with that unit',
                immediateEffect: abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                    target: context.player.opponent.hand,
                    canChooseFewer: false,
                    immediateEffect: abilityHelper.immediateEffects.discardSpecificCard(),
                    cardCondition: (card) => card.hasSomeAspect(ifYouDoContext.target.aspects)
                }))
            })
        });
    }
}