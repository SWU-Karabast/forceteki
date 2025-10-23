import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { EventCard } from '../../../core/card/EventCard';
import { EventName, RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';

export default class LetsTalk extends EventCard {
    private cardsLeftPlayThisPhaseWatcher: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '8619707446',
            internalName: 'lets-talk',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsLeftPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsLeftPlayThisPhase();
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'If a friendly unit left play this phase, this event costs 3 resources less to play',
            amount: 3,
            condition: (context) => this.cardsLeftPlayThisPhaseWatcher.someUnitLeftPlay({ controller: context.player })
        });

        registrar.setEventAbility({
            title: 'Each friendly unit captures an enemy non-leader unit in the same arena',
            targetResolver: {
                activePromptTitle: 'Choose the order for each friendly unit to capture an enemy non-leader unit in the same arena',
                mode: TargetMode.ExactlyVariable,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: RelativePlayer.Self,
                numCardsFunc: (context) => context.player.getArenaUnits().length,
            },
            then: (chosenUnitsContext) => ({
                title: 'Each friendly unit captures an enemy non-leader unit in the same arena',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                    chosenUnitsContext.target?.map((target) =>
                        AbilityHelper.immediateEffects.selectCard({
                            activePromptTitle: `Choose a unit to capture with ${target.title}`,
                            player: RelativePlayer.Self,
                            cardTypeFilter: WildcardCardType.NonLeaderUnit,
                            zoneFilter: target.zoneName,
                            controller: RelativePlayer.Opponent,
                            cardCondition: (card, context) => !this.capturedCardsFromContext(context).has(card),
                            immediateEffect: AbilityHelper.immediateEffects.capture({ captor: target })
                        })
                    )
                )
            })
        });
    }

    private capturedCardsFromContext(context: AbilityContext): Set<Card> {
        return new Set(context.events.filter((event) => event.name === EventName.OnCardCaptured).map((event) => event.card));
    }
}
