import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { GameStateChangeRequired, RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IThenAbilityPropsWithSystems } from '../../../Interfaces';

export default class EndlessLegions extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5576996578',
            internalName: 'endless-legions',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Reveal any number of resources you control',
            targetResolver: {
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.reveal({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                }),
            },
            then: (context) => this.playRevealedCard([], context),
        });
    }

    private playRevealedCard(playedCards: Card[], revealedCardsContext: AbilityContext): IThenAbilityPropsWithSystems<AbilityContext> {
        return {
            title: 'Play a revelead unit for free',
            targetResolver: {
                activePromptTitle: 'Choose a unit to play for free',
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                cardCondition: (card: Card) => revealedCardsContext.target?.includes(card) && !playedCards.includes(card),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    playAsType: WildcardCardType.Unit,
                    canPlayFromAnyZone: true,
                    nested: true,
                })
            },
            then: (context) => this.playRevealedCard([...playedCards, context.target], revealedCardsContext),
        };
    }
}
