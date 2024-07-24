import { GameModes } from '../../../GameModes';
import { Phases } from '../../Constants';
import { Locations } from '../../Constants';
import { randomItem } from '../../utils/helpers';
import type BaseCard from '../../card/basecard';
import type Game from '../../game';
import { Phase } from '../Phase';
import { SimpleStep } from '../SimpleStep';
import ResourcePrompt from '../basic_steps/resourceprompt';

export class RegroupPhase extends Phase {
    constructor(game: Game) {
        super(game, Phases.Regroup);
        this.pipeline.initialise([
            new SimpleStep(game, () => this.drawTwo()),
            new ResourcePrompt(game, 0, 1),
            new SimpleStep(game, () => this.endPhase())
        ]);
    }
    
    drawTwo() {
        for (const player of this.game.getPlayers()) {
            player.drawCardsToHand(2);
        }
    }
}
