import { GameModes } from '../../../GameModes';
import { Phases } from '../../core/Constants';
import { Locations } from '../../core/Constants';
import { randomItem } from '../../core/utils/Helpers';
import type BaseCard from '../../core/card/basecard';
import type Game from '../../core/Game';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import ResourcePrompt from '../resourceprompt';

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
