import { EventNames, Locations, Phases, Players } from '../Constants';
import { ready, returnRing } from '../GameActions/GameActions';
import type Game from '../game';
import type Player from '../player';
import { Phase } from './Phase';
import { SimpleStep } from './SimpleStep';
import ActionWindow from './actionwindow';
import { EndRoundPrompt } from './regroup/EndRoundPrompt'

/**
 * V Regroup Phase
 * 5.1 Regroup phase begins.
 *     ACTION WINDOW
 * 5.2 Ready cards.
 * 5.3 Discard from provinces.
 * 5.4 Return rings.
 * 5.5 Pass first player token.
 * 5.6 Regroup phase ends.
 */
export class RegroupPhase extends Phase {
    constructor(game: Game) {
        super(game, Phases.Regroup);
        this.initialise([
            new ActionWindow(this.game, 'Action Window', 'regroup'),
            new SimpleStep(game, () => this.readyCards()),
            new SimpleStep(game, () => this.discardFromProvinces()),
            new SimpleStep(game, () => this.returnRings()),
            new SimpleStep(game, () => this.passFirstPlayer()),
            new EndRoundPrompt(game),
            new SimpleStep(game, () => this.roundEnded())
        ]);
    }

    readyCards() {
        const cardsToReady = this.game.allCards.filter((card) => card.bowed && card.readiesDuringReadyPhase());
        ready().resolve(cardsToReady, this.game.getFrameworkContext());
    }

    discardFromProvinces() {
        for (const player of this.game.getPlayersInFirstPlayerOrder()) {
            this.game.queueSimpleStep(() => this.discardFromProvincesForPlayer(player));
        }
    }

    discardFromProvincesForPlayer(player: Player) {
        let cardsToDiscard = [];
        let cardsOnUnbrokenProvinces = [];
        for (const location of this.game.getProvinceArray()) {
            const provinceCard = player.getProvinceCardInProvince(location);
            const province = player.getSourceList(location);
            const dynastyCards = province.filter((card) => card.isDynasty && card.isFaceup());
            if (dynastyCards.length > 0 && provinceCard) {
                if (provinceCard.isBroken) {
                    cardsToDiscard = cardsToDiscard.concat(dynastyCards);
                } else {
                    cardsOnUnbrokenProvinces = cardsOnUnbrokenProvinces.concat(dynastyCards);
                }
            }
        }

        if (cardsOnUnbrokenProvinces.length > 0) {
            this.game.promptForSelect(player, {
                source: 'Discard Dynasty Cards',
                numCards: 0,
                multiSelect: true,
                optional: true,
                activePromptTitle: 'Select dynasty cards to discard',
                waitingPromptTitle: 'Waiting for opponent to discard dynasty cards',
                location: Locations.Provinces,
                controller: Players.Self,
                cardCondition: (card) => cardsOnUnbrokenProvinces.includes(card),
                onSelect: (player, cards) => {
                    cardsToDiscard = cardsToDiscard.concat(cards);
                    if (cardsToDiscard.length > 0) {
                        this.game.addMessage('{0} discards {1} from their provinces', player, cardsToDiscard);
                        this.game.applyGameAction(this.game.getFrameworkContext(), { discardCard: cardsToDiscard });
                    }
                    return true;
                },
                onCancel: () => {
                    if (cardsToDiscard.length > 0) {
                        this.game.addMessage('{0} discards {1} from their provinces', player, cardsToDiscard);
                        this.game.applyGameAction(this.game.getFrameworkContext(), { discardCard: cardsToDiscard });
                    }
                    return true;
                }
            });
        } else if (cardsToDiscard.length > 0) {
            this.game.addMessage('{0} discards {1} from their provinces', player, cardsToDiscard);
            this.game.applyGameAction(this.game.getFrameworkContext(), { discardCard: cardsToDiscard });
        }

        this.game.queueSimpleStep(() => {
            for (const location of this.game.getProvinceArray(false)) {
                this.game.queueSimpleStep(() => {
                    player.replaceDynastyCard(location);
                    return true;
                });
            }
        });
    }

    returnRings() {
        const claimedRings = Object.values(this.game.rings).filter((ring) => ring.claimed);
        returnRing().resolve(claimedRings, this.game.getFrameworkContext());
    }

    passFirstPlayer() {
        const firstPlayer = this.game.getFirstPlayer();
        const otherPlayer = this.game.getOtherPlayer(firstPlayer);
        if (otherPlayer) {
            this.game.raiseEvent(EventNames.OnPassFirstPlayer, { player: otherPlayer }, () =>
                this.game.setFirstPlayer(otherPlayer)
            );
        }
    }

    roundEnded() {
        this.game.raiseEvent(EventNames.OnRoundEnded);
    }
}
