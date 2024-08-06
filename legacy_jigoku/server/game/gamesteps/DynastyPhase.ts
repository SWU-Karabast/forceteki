import { EffectNames, EventNames, Phases } from '../Constants';
import type DrawCard from '../drawcard';
import type Game from '../game';
import { Phase } from './Phase';
import { SimpleStep } from './SimpleStep';
import { DynastyActionWindow } from './dynasty/DynastyActionWindow';

/*
I Dynasty Phase
1.1 Dynasty phase begins.
1.2 Reveal facedown dynasty cards.
1.3 Collect fate.
1.4 SPECIAL ACTION WINDOW
    Players alternate playing cards from
    provinces and/or triggering Action abilities.
1.5 Dynasty phase ends.
 */

export class DynastyPhase extends Phase {
    constructor(
        game: Game,
        private gainFate = true
    ) {
        super(game, Phases.Dynasty);
        this.initialise([
            new SimpleStep(game, () => this.#beginDynasty()),
            new SimpleStep(game, () => this.#flipDynastyCards()),
            new SimpleStep(game, () => this.#collectFate()),
            new SimpleStep(game, () => this.#dynastyActionWindowStep())
        ]);

        this.steps.push(new SimpleStep(game, () => this.#checkForRepeatDynasty()));
    }

    createPhase(): void {
        this.game.conflictRecord = [];
        super.createPhase();
    }

    #beginDynasty() {
        for (const player of this.game.getPlayersInFirstPlayerOrder()) {
            player.beginDynasty();
        }
    }

    #flipDynastyCards() {
        const allRevealedCards = new Set<DrawCard>();
        for (const player of this.game.getPlayersInFirstPlayerOrder()) {
            const revealedCards = new Set<DrawCard>();
            for (const province of this.game.getProvinceArray()) {
                for (const card of player.getDynastyCardsInProvince(province) as DrawCard[]) {
                    if (card.isFacedown()) {
                        this.game.applyGameAction(null, { flipDynasty: card });
                        revealedCards.add(card);
                        allRevealedCards.add(card);
                    }
                }
            }
            if (revealedCards.size > 0) {
                this.game.queueSimpleStep(() =>
                    this.game.addMessage('{0} reveals {1}', player, Array.from(revealedCards))
                );
            }
        }

        this.game.raiseEvent(EventNames.OnRevealFacedownDynastyCards, { allRevealedCards });
    }

    #collectFate() {
        if (!this.gainFate) {
            return;
        }
        for (const player of this.game.getPlayersInFirstPlayerOrder()) {
            player.collectFate();
        }
    }

    #dynastyActionWindowStep() {
        this.game.queueStep(new DynastyActionWindow(this.game));
    }

    #checkForRepeatDynasty() {
        let restarted = false;
        for (const player of this.game.getPlayersInFirstPlayerOrder()) {
            if (!restarted && player.anyEffect(EffectNames.RestartDynastyPhase)) {
                restarted = true;
                player.resetHonorEvents(this.game.roundNumber, this.game.currentPhase);
                const effectSource = player.mostRecentEffect(EffectNames.RestartDynastyPhase);
                this.game.addMessage('{0} has started a new dynasty phase!', effectSource);
                const dynastyPhase = new DynastyPhase(this.game, false);
                this.game.queueStep(dynastyPhase);
            }
        }
    }
}