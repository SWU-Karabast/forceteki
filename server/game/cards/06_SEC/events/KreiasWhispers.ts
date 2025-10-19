import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { GameStateChangeRequired, RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';

export default class KreiasWhispers extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3661373584',
            internalName: 'kreias-whispers',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Draw 3 cards, then put one card from your hand on the top of your deck and another card from your hand on the bottom of your deck',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.draw({ amount: 3 }),
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Select 1 card',
                    mode: TargetMode.Exactly,
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    numCards: 1,
                    mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                    effect: 'choose 1 card to move to the top of their deck',
                    immediateEffect: AbilityHelper.immediateEffects.moveToTopOfDeck({})
                }),
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Select 1 card',
                    mode: TargetMode.Exactly,
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    numCards: 1,
                    mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                    effect: 'choose 1 card to move to the bottom of their deck',
                    immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck()
                }),
            ])
        });
    }
}