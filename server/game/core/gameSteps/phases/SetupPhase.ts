import { Location } from '../../Constants';
import { randomItem } from '../../utils/Helpers';
import type Card from '../../card/Card';
import type Game from '../../Game';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import ResourcePrompt from '../prompts/ResourcePrompt';
import Player from '../../Player';

export class SetupPhase extends Phase {
    constructor(game: Game) {
        const name = 'setup';
        super(game, name);
        this.game.currentPhase = name;
        this.pipeline.initialise([
            new SimpleStep(game, () => this.putBaseInPlay()),
            new SimpleStep(game, () => this.putLeaderInPlay()),
            new SimpleStep(game, () => this.chooseFirstPlayer()),
            new SimpleStep(game, () => this.drawStartingHands()),
            new SimpleStep(game, () => this.chooseMulligan()),
            new ResourcePrompt(game, 2, 2),

            // there aren't clear game rules yet for resolving events that trigger during the setup step, so we skip the event window here
            new SimpleStep(game, () => this.endPhase(true))
        ]);
    }

    putBaseInPlay() {
        for (const player of this.game.getPlayers()) {
            player.moveCard(player.base, Location.Base);
            player.damageToBase = 0;
        }
    }

    putLeaderInPlay() {
        for (const player of this.game.getPlayers()) {
            player.moveCard(player.leader, Location.Leader);
        }
    }

    chooseFirstPlayer() {
        const coinTossWinner = randomItem(this.game.getPlayers());
        if (coinTossWinner) {
            var firstPlayer = coinTossWinner;
        }

        this.game.promptWithHandlerMenu(firstPlayer, {
            activePromptTitle: 'You won the flip. Do you want to start with initiative:',
            source: 'Choose Initiative Player',
            choices: ['Yes', 'No'],
            handlers: [
                () => {
                    this.game.initiativePlayer = firstPlayer;
                },
                () => {
                    this.game.initiativePlayer = firstPlayer.opponent;
                }
            ]
        });
    }

    chooseMulligan() {
        const playersByInitiative = [this.game.initiativePlayer, this.game.initiativePlayer.opponent];
        for (const player of playersByInitiative) {
            this.game.promptWithHandlerMenu(player, {
                activePromptTitle: 'Do you want to mulligan your hand?',
                source: 'Mulligan',
                choices: ['Yes', 'No'],
                handlers: [
                    () => {
                        for(const card of player.hand) {
                            player.moveCard(card, 'deck bottom');
                        }

                        player.shuffleDeck();
                        player.drawCardsToHand(6);
                        this.game.addMessage('{0} has mulliganed', player);
                    },
                    () => {
                        this.game.addMessage('{0} has not mulliganed', player);
                    }
                ]
            })
        }
    }
    
    drawStartingHands() {
        for (const player of this.game.getPlayers()) {
            player.shuffleDeck();
            player.drawCardsToHand(6);
        }
    }
}
