import { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { CardTypes, EventNames, Locations, Players, PlayTypes } from '../../../Constants';
import { ReduceableFateCost } from '../../../costs/ReduceableFateCost';
import DrawCard from '../../../drawcard';
import { EventRegistrar } from '../../../EventRegistrar';
import Player from '../../../player';

class HifumiCost extends ReduceableFateCost {
    isPlayCost = false;
    isPrintedFateCost = false;

    #timesTriggered = new WeakMap<Player, number>();

    refreshHifumiCount(): void {
        this.#timesTriggered = new WeakMap();
    }

    currentCost(player: Player): number {
        return this.#timesTriggered.get(player) ?? 0;
    }

    canPay(context: AbilityContext<any>): boolean {
        const cost = this.currentCost(context.player);
        if (cost === 0) {
            return true;
        }

        let totalFateAvailable = 0;
        for (const card of this.#cardsThatCanPayForHifumi(context)) {
            totalFateAvailable += card.fate;
            if (totalFateAvailable >= cost) {
                return true;
            }
        }

        return false;
    }

    protected getReducedCost(context: AbilityContext): number {
        return this.currentCost(context.player);
    }

    protected getAlternateFatePools(context: AbilityContext): Set<DrawCard> {
        return this.#cardsThatCanPayForHifumi(context);
    }

    protected afterPayHook(event: any): void {
        const player = event.context.player;
        this.#timesTriggered.set(player, this.currentCost(player) + 1);
    }

    #cardsThatCanPayForHifumi(context: AbilityContext<any>): Set<DrawCard> {
        return new Set(
            context.player.cardsInPlay.filter((c: DrawCard) => c.type === CardTypes.Character && c.getFate() > 0)
        );
    }
}

export default class IsawaHifumi extends DrawCard {
    static id = 'isawa-hifumi';

    hifumiCost: HifumiCost;

    setupCardAbilities() {
        this.hifumiCost = new HifumiCost(false);
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnRoundEnded, EventNames.OnCardLeavesPlay]);

        this.action({
            title: 'Play an event from discard',
            cost: this.hifumiCost,
            cannotTargetFirst: true,
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                activePromptTitle: 'Choose an event',
                cardType: CardTypes.Event,
                controller: Players.Self,
                location: Locations.ConflictDiscardPile,
                gameAction: AbilityDsl.actions.playCard({
                    resetOnCancel: true,
                    source: this,
                    playType: PlayTypes.PlayFromHand,
                    postHandler: (eventContext) => {
                        const card = eventContext.source;
                        context.game.addMessage("{0} is removed from the game by {1}'s ability", card, context.source);
                        context.player.moveCard(card, Locations.RemovedFromGame);
                    }
                })
            })),
            effect: 'play an event from their discard pile (the next time it is used this round will cost {1} fate from {2} characters)',
            effectArgs: (context) => [this.hifumiCost.currentCost(context.player), context.player],
            limit: AbilityDsl.limit.unlimited()
        });
    }

    public onRoundEnded() {
        this.hifumiCost.refreshHifumiCount();
    }

    public onCardLeavesPlay(event: any) {
        if (event.card === this) {
            this.hifumiCost.refreshHifumiCount();
        }
    }
}