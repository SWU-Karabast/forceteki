import { GameModes } from '../../GameModes';
import { Locations } from '../Constants';
import { randomItem } from '../Utils/helpers';
import type BaseCard from '../basecard';
import type Game from '../game';
import { Phase } from './Phase';
import { SimpleStep } from './SimpleStep';
import MulliganConflictPrompt from './setup/mulliganconflictprompt';
import MulliganDynastyPrompt from './setup/mulligandynastyprompt';
import SetupProvincesPrompt from './setup/setupprovincesprompt';

export class SetupPhase extends Phase {
    constructor(game: Game) {
        const name = 'setup';
        super(game, name);
        this.game.currentPhase = name;
        this.pipeline.initialise([
            new SimpleStep(game, () => this.setupBegin()),
            new SimpleStep(game, () => this.chooseFirstPlayer()),
            new SimpleStep(game, () => this.attachStronghold()),
            new SimpleStep(game, () => this.setupProvinces()),
            new SimpleStep(game, () => this.fillProvinces()),
            new MulliganDynastyPrompt(game),
            new SimpleStep(game, () => this.drawStartingHands()),
            new MulliganConflictPrompt(game),
            new SimpleStep(game, () => this.startGame())
        ]);
    }

    setupBegin() {
        const coinTossWinner = randomItem(this.game.getPlayers());
        if (coinTossWinner) {
            coinTossWinner.firstPlayer = true;
        }
    }

    chooseFirstPlayer() {
        const firstPlayer = this.game.getFirstPlayer();
        if (!firstPlayer.opponent) {
            return;
        }

        if (
            firstPlayer.stronghold?.stealFirstPlayerDuringSetupWithMsg &&
            !firstPlayer.opponent.stronghold?.stealFirstPlayerDuringSetupWithMsg
        ) {
            return;
        }

        if (
            !firstPlayer.stronghold?.stealFirstPlayerDuringSetupWithMsg &&
            firstPlayer.opponent.stronghold?.stealFirstPlayerDuringSetupWithMsg
        ) {
            firstPlayer.firstPlayer = false;
            firstPlayer.opponent.firstPlayer = true;
            this.game.addMessage(firstPlayer.opponent.stronghold.stealFirstPlayerDuringSetupWithMsg, [
                firstPlayer.opponent
            ]);
            return;
        }

        this.game.promptWithHandlerMenu(firstPlayer, {
            activePromptTitle: 'You won the flip. Do you want to be:',
            source: 'Choose First Player',
            choices: ['First Player', 'Second Player'],
            handlers: [
                () => {
                    this.game.setFirstPlayer(firstPlayer);
                },
                () => {
                    this.game.setFirstPlayer(firstPlayer.opponent);
                }
            ]
        });
    }

    attachStronghold() {
        if (this.game.gameMode === GameModes.Skirmish) {
            return;
        }
        for (const player of this.game.getPlayers()) {
            player.moveCard(player.stronghold, Locations.StrongholdProvince);
            if (player.role) {
                player.role.moveTo(Locations.Role);
            }
        }
    }

    setupProvinces() {
        if (this.game.gameMode === GameModes.Skirmish) {
            for (const player of this.game.getPlayers()) {
                player.moveCard(player.provinceDeck.first(), Locations.ProvinceOne);
                player.moveCard(player.provinceDeck.first(), Locations.ProvinceTwo);
                player.moveCard(player.provinceDeck.first(), Locations.ProvinceThree);
                player.hideProvinceDeck = true;
            }
        } else {
            this.queueStep(new SetupProvincesPrompt(this.game));
        }
    }

    fillProvinces() {
        const provinces = [Locations.ProvinceOne, Locations.ProvinceTwo, Locations.ProvinceThree];
        if (this.game.gameMode !== GameModes.Skirmish) {
            provinces.push(Locations.ProvinceFour);
        }
        for (const player of this.game.getPlayers()) {
            for (const province of provinces) {
                const card = player.dynastyDeck.first();
                if (card) {
                    player.moveCard(card, province);
                    card.facedown = false;
                }
            }
        }

        for (const card of this.game.allCards.toArray() as BaseCard[]) {
            card.applyAnyLocationPersistentEffects();
        }
    }

    drawStartingHands() {
        for (const player of this.game.getPlayers()) {
            player.drawCardsToHand(this.game.gameMode === GameModes.Skirmish ? 3 : 4);
        }
    }

    startGame() {
        for (const player of this.game.getPlayers()) {
            player.honor = this.game.gameMode === GameModes.Skirmish ? 6 : player.stronghold.cardData.honor;
            player.readyToStart = true;
        }
        this.endPhase();
    }
}
