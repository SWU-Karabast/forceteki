import { EventName, PhaseName } from '../../Constants';
import { Location } from '../../Constants';
import { randomItem } from '../../utils/Helpers';
import type { Card } from '../../card/Card';
import type Game from '../../Game';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import { VariableResourcePrompt } from '../prompts/VariableResourcePrompt';
import { CardWithExhaustProperty } from '../../card/CardTypes';
import { GameEvent } from '../../event/GameEvent';
import * as GameSystemLibrary from '../../../gameSystems/GameSystemLibrary';

export class RegroupPhase extends Phase {
    public constructor(game: Game) {
        super(game, PhaseName.Regroup);
        this.initialise([
            new SimpleStep(game, () => this.drawTwo(), 'drawTwo'),
            new VariableResourcePrompt(game, 0, 1),
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

            if (!(player.leader.deployed)) {
                cardsToReady.push(player.leader);
            }
        }

        // create a single event for the ready cards step as well as individual events for readying each card
        const events = [new GameEvent(EventName.OnRegroupPhaseReadyCards, {})];
        GameSystemLibrary.ready({ isRegroupPhaseReadyStep: true, target: cardsToReady })
            .queueGenerateEventGameSteps(events, this.game.getFrameworkContext());

        this.game.queueSimpleStep(() => this.game.openEventWindow(events), 'open event window for card readying effects');
    }
}
