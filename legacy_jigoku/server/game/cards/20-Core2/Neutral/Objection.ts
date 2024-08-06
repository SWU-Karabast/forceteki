import type { AbilityContext } from '../../../AbilityContext';
import { CardTypes, EventNames } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { Cost } from '../../../Costs';
import type Player from '../../../player';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';
import type Game from '../../../game';
import { EventRegistrar } from '../../../EventRegistrar';

const GLOBAL_TRACKER = new WeakMap<Game, WeakMap<Player, number>>();

function refreshObjectionCost(game: Game): void {
    GLOBAL_TRACKER.set(game, new WeakMap());
}

function currentObjectionCost(player: Player): number {
    return GLOBAL_TRACKER.get(player.game)?.get(player) ?? 0;
}

function increaseObjectionCost(player: Player) {
    const gameTracker = GLOBAL_TRACKER.get(player.game);
    if (!gameTracker) {
        GLOBAL_TRACKER.set(player.game, new WeakMap([[player, 1]]));
        return;
    }
    gameTracker.set(player, currentObjectionCost(player) + 1);
}

class ObjectionCost implements Cost {
    getActionName(): string {
        return 'objectionCost';
    }

    canPay(context: AbilityContext): boolean {
        const amount = currentObjectionCost(context.player);
        return amount === 0 || AbilityDsl.actions.loseFate({ target: context.player, amount }).hasLegalTarget(context);
    }

    pay(context: TriggeredAbilityContext): void {
        const fateCost = currentObjectionCost(context.player);
        if (fateCost > 0) {
            AbilityDsl.actions.loseFate({ target: context.player, amount: fateCost }).resolve(context.player, context);
        }

        increaseObjectionCost(context.player);
    }
}

export default class Objection extends DrawCard {
    static id = 'objection-';

    setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnPhaseStarted]);

        this.wouldInterrupt({
            title: 'Cancel an event',
            when: {
                onInitiateAbilityEffects: (event, context) =>
                    event.card.type === CardTypes.Event && context.player.imperialFavor !== ''
            },
            cannotBeMirrored: true,
            cost: new ObjectionCost(),
            gameAction: AbilityDsl.actions.cancel()
        });
    }

    onPhaseStarted() {
        refreshObjectionCost(this.game);
    }
}