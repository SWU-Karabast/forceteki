import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DeployType, KeywordName, PlayType, RelativePlayer, WildcardCardType } from '../core/Constants';
import { CardType, EventName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { Contract } from '../core/utils/Contract';
import { GameEvent } from '../core/event/GameEvent';
import { RevealSystem } from './RevealSystem';
import { ViewCardInteractMode } from './ViewCardSystem';
import { PlayCardSystem } from './PlayCardSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDeployLeaderProperties extends ICardTargetSystemProperties {}

export function promptForPlotCardsToReveal(event): void {
    const plotSystem = new PlayCardSystem({
        canPlayFromAnyZone: true,
        playType: PlayType.Plot,
        playAsType: WildcardCardType.Any
    });
    const plotCards = event.card.controller.resources.filter((card: Card) =>
        card.hasSomeKeyword(KeywordName.Plot) &&
        plotSystem.canAffect(card, event.context.copy({ source: card, player: event.card.controller }))
    );
    event.plotCardsSelected = [];

    if (plotCards.length === 0) {
        return;
    }

    event.context.game.promptDisplayCardsForSelection(event.card.controller, {
        activePromptTitle: 'Reveal cards with Plot',
        source: event.card,
        displayCards: plotCards,
        maxCards: plotCards.length,
        canChooseFewer: true,
        selectedCardsButtonText: 'Reveal',
        noSelectedCardsButtonText: 'Reveal none',
        selectedCardsHandler: (selectedCards: Card[]) => {
            event.plotCardsSelected = selectedCards;

            if (selectedCards.length === 0) {
                return;
            }

            const revealEvents = [];
            const revealSystem = new RevealSystem({
                interactMode: ViewCardInteractMode.ViewOnly,
                target: selectedCards,
                promptedPlayer: RelativePlayer.Opponent,
                useDisplayPrompt: true,
                activePromptTitle: 'Cards revealed with Plot'
            });

            revealSystem.queueGenerateEventGameSteps(revealEvents, event.context);
            event.context.game.queueSimpleStep(() => event.context.game.openEventWindow(revealEvents), 'reveal selected Plot cards');
        }
    });
}

export class DeployLeaderSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDeployLeaderProperties> {
    public override readonly name = 'deploy leader';
    public override readonly eventName = EventName.OnLeaderDeployed;
    public override readonly effectDescription = 'deploy {0}';

    protected override readonly targetTypeFilter = [CardType.Leader];

    public eventHandler(event): void {
        Contract.assertTrue(event.card.isDeployableLeader());

        event.card.deploy({ type: DeployType.LeaderUnit });
        promptForPlotCardsToReveal(event);
    }

    public override canAffectInternal(card: Card, context: TContext): boolean {
        if (!card.isLeader() || card.isDeployableLeader() && card.deployed) {
            return false;
        }
        return super.canAffectInternal(card, context);
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<IDeployLeaderProperties> = {}) {
        super.updateEvent(event, card, context, additionalProperties);
        event.setContingentEventsGenerator(() => {
            const entersPlayEvent = new GameEvent(EventName.OnUnitEntersPlay, context, {
                player: context.player,
                card
            });

            return [entersPlayEvent];
        });
    }
}
