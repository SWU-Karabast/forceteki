import { PhaseName } from '../../Constants';
import { Location } from '../../Constants';
import { randomItem } from '../../utils/Helpers';
import type Card from '../../card/Card';
import type Game from '../../Game';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import ResourcePrompt from '../prompts/ResourcePrompt';

export class RegroupPhase extends Phase {
    public constructor(game: Game) {
        super(game, PhaseName.Regroup);
        this.pipeline.initialise([
            new SimpleStep(game, () => this.drawTwo(), 'drawTwo'),
            new ResourcePrompt(game, 0, 1),
            new SimpleStep(game, () => this.endPhase(), 'endPhase')
        ]);
    }

    private drawTwo() {
        for (const player of this.game.getPlayers()) {
            player.drawCardsToHand(2);
        }
    }
}
