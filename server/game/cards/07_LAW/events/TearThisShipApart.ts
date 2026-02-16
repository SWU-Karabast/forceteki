import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class TearThisShipApart extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'tear-this-ship-apart-id',
            internalName: 'tear-this-ship-apart',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Look at all of an opponent\'s resources. You may play 1 of those cards for free. If you do, that opponent resources the top card of their deck.',
            immediateEffect: abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                target: context.player.opponent.resources,
                canChooseFewer: true,
                immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    canPlayFromAnyZone: true,
                    playAsType: WildcardCardType.Any,
                }),
            })),
            ifYouDo: {
                title: 'Opponent resources the top card of their deck',
                ifYouDoCondition: (context) => context.selectedPromptCards.length > 0,
                immediateEffect: abilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.opponent.getTopCardOfDeck(),
                    targetPlayer: RelativePlayer.Opponent,
                }))
            }
        });
    }
}