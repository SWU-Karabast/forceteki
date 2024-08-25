import { EventName, PhaseName } from '../../Constants';
import { Location } from '../../Constants';
import { randomItem } from '../../utils/Helpers';
import type { Card } from '../../card/Card';
import type Game from '../../Game';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import ResourcePrompt from '../prompts/ResourcePrompt';
import { CardWithExhaustProperty } from '../../card/CardTypes';
import { GameEvent } from '../../event/GameEvent';

export class RegroupPhase extends Phase {
    public constructor(game: Game) {
        super(game, PhaseName.Regroup);
        this.pipeline.initialise([
            new SimpleStep(game, () => this.drawTwo(), 'drawTwo'),
            new ResourcePrompt(game, 0, 1),
            new SimpleStep(game, () => this.readyAllCards(), 'readyAllCards'),
            new SimpleStep(game, () => this.endPhase(), 'endPhase')
        ]);
    }

    private drawTwo() {
        for (const player of this.game.getPlayers()) {
            player.drawCardsToHand(2);
        }
    }

    private readyAllCards() {
        const cardsToReady: CardWithExhaustProperty[] = [];

        for (const player of this.game.getPlayers()) {
            cardsToReady.push(...player.getUnitsInPlay());
            cardsToReady.push(...player.getResourceCards());
        }

        const readyContextWithTargets = Object.assign(this.game.getFrameworkContext(), { targets: cardsToReady });

        // create a single event for the ready cards step as well as individual events for readying each card
        let events = [new GameEvent(EventName.OnRegroupPhaseReadyCards, {})];
        events = events.concat(
            this.game.actions.ready({ isRegroupPhaseReadyStep: true })
                .generateEventsForAllTargets(readyContextWithTargets));

        this.game.openEventWindow(events);
    }
}
