import { GameModes } from '../../GameModes';
import { Phases, CardTypes, Players, EffectNames, EventNames, Locations } from '../Constants';
import type DrawCard from '../drawcard';
import type Game from '../game';
import type Player from '../player';
import { Phase } from './Phase';
import { SimpleStep } from './SimpleStep';
import ActionWindow from './actionwindow';

function characterShouldBeDiscarded(character: DrawCard) {
    return character.fate === 0 && character.allowGameAction('discardFromPlay');
}

/**
 * IV. Fate Phase
 * 4.1 Fate phase begins.
 * 4.2 Discard characters with no fate.
 * 4.3 Remove fate from characters.
 * 4.4 Place fate on unclaimed rings.
 * ◊ ACTION WINDOW
 * Proceed to Dynasty Phase.
 * 4.6 Discard from provinces.
 * 4.5 Ready cards.
 * 4.7 Return rings.
 * 4.8 Pass first player token.
 * 4.9 Fate phase ends
 */
export class FatePhase extends Phase {
    constructor(game: Game) {
        super(game, Phases.Fate);
        this.initialise([
            new SimpleStep(game, () => this.discardCharactersWithNoFate()),
            new SimpleStep(game, () => this.removeFateFromCharacters()),
            new SimpleStep(game, () => this.placeFateOnUnclaimedRings()),
            new ActionWindow(this.game, 'Action Window', 'fate'),
            new SimpleStep(game, () => this.readyCards()),
            new SimpleStep(game, () => this.discardFromProvinces()),
            new SimpleStep(game, () => this.returnRings()),
            new SimpleStep(game, () => this.passFirstPlayer())
        ]);
    }

    discardCharactersWithNoFate() {
        for (const player of this.game.getPlayersInFirstPlayerOrder()) {
            this.game.queueSimpleStep(() =>
                this.promptPlayerToDiscard(player, new Set(player.cardsInPlay.filter(characterShouldBeDiscarded)))
            );
        }
    }

    promptPlayerToDiscard(player: Player, cardsToDiscard: Set<DrawCard>) {
        for (const card of cardsToDiscard) {
            if (!characterShouldBeDiscarded(card)) {
                cardsToDiscard.delete(card);
            }
        }

        if (cardsToDiscard.size === 0) {
            return;
        }

        this.game.promptForSelect(player, {
            source: 'Fate Phase',
            activePromptTitle: 'Choose character to discard\n(or click Done to discard all characters with no fate)',
            waitingPromptTitle: 'Waiting for opponent to discard characters with no fate',
            cardCondition: (card: DrawCard) => cardsToDiscard.has(card),
            cardType: CardTypes.Character,
            controller: Players.Self,
            buttons: [{ text: 'Done', arg: 'cancel' }],
            onSelect: (player: Player, selectedCard: DrawCard) => {
                this.game.applyGameAction(null, { discardFromPlay: selectedCard });

                cardsToDiscard.delete(selectedCard);

                this.game.queueSimpleStep(() => this.promptPlayerToDiscard(player, cardsToDiscard));
                return true;
            },
            onCancel: () => {
                for (const character of cardsToDiscard) {
                    this.game.applyGameAction(null, { discardFromPlay: character });
                }
            }
        });
    }

    removeFateFromCharacters() {
        const context = this.game.getFrameworkContext();
        const events = this.game.applyGameAction(context, {
            removeFate: this.game.findAnyCardsInPlay((card) => card.allowGameAction('removeFate'))
        });
        let processed = false;
        this.game.queueSimpleStep(() => {
            for (const player of this.game.getPlayersInFirstPlayerOrder()) {
                if (!processed) {
                    const numFate = events.filter((a) => !('recipient' in a) || a.recipient == null).length;
                    const postFunc = player.mostRecentEffect(EffectNames.CustomFatePhaseFateRemoval);
                    if (postFunc) {
                        postFunc(player, numFate);
                        processed = true;
                    }
                }
            }
        });
    }

    placeFateOnUnclaimedRings() {
        if (this.game.gameMode === GameModes.Skirmish) {
            return;
        }
        const recipients = Object.values(this.game.rings)
            .filter((ring) => ring.isUnclaimed())
            .map((ring) => ({ ring: ring, amount: 1 }));
        this.game.raiseEvent(EventNames.OnPlaceFateOnUnclaimedRings, { recipients: recipients }, () => {
            recipients.forEach((recipient) => recipient.ring.modifyFate(recipient.amount));
        });
    }

    discardFromProvinces() {
        for (const player of this.game.getPlayersInFirstPlayerOrder()) {
            this.game.queueSimpleStep(() => this.discardFromProvincesForPlayer(player));
        }
    }

    discardFromProvincesForPlayer(player) {
        let cardsToDiscard = [];
        let cardsOnUnbrokenProvinces = [];
        for (const location of this.game.getProvinceArray()) {
            const provinceCard = player.getProvinceCardInProvince(location);
            const province = player.getSourceList(location);
            const dynastyCards = province.filter((card: DrawCard) => card.isDynasty && card.isFaceup());
            if (dynastyCards.length > 0 && provinceCard) {
                if (provinceCard.isBroken && this.game.gameMode !== GameModes.Skirmish) {
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

    readyCards() {
        const cardsToReady = this.game.allCards.filter((card) => card.bowed && card.readiesDuringReadyPhase());
        this.game.actions.ready().resolve(cardsToReady, this.game.getFrameworkContext());
    }

    returnRings() {
        const claimedRings = Object.values(this.game.rings).filter((ring) => ring.claimed);
        this.game.actions.returnRing().resolve(claimedRings, this.game.getFrameworkContext());
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
}
