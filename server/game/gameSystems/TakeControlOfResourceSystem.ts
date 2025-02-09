import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, EventName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import type Player from '../core/Player';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ITakeControlOfResourceProperties extends IPlayerTargetSystemProperties {}

/**
 * Used for taking control of some resource from a player algorithmically, instead of specifying a specific card in advance.
 * The selected resource is random, but always a ready resource if available.
 *
 * The `target` player is the player who will be _taking_ the resource, and their opponent will be losing it.
 */
export class TakeControlOfResourceSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ITakeControlOfResourceProperties> {
    public override readonly name = 'takeControl';
    public override readonly eventName = EventName.OnTakeControl;

    public eventHandler(event): void {
        const card = event.card as Card;
        Contract.assertTrue(card.canBeExhausted());

        const exhausted = card.exhausted;
        card.takeControl(event.newController);

        if (exhausted) {
            card.exhaust();
        } else {
            card.ready();
        }
    }

    public override canAffect(player: Player | Player[], context: TContext, _additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const takingResourcePlayer = this.playerFromArray(player);

        if (mustChangeGameState !== GameStateChangeRequired.None && takingResourcePlayer.opponent.resources.length === 0) {
            return false;
        }

        return super.canAffect(takingResourcePlayer, context);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { target } = this.generatePropertiesFromContext(context);

        const takingResourcePlayer = this.playerFromArray(target);

        return ['{0} takes control of a resource from {1}', [takingResourcePlayer, takingResourcePlayer.opponent]];
    }

    public override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties?: any): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        event.newController = player;

        player.opponent.resourceZone.rearrangeResourceExhaustState(context, true);
        const opponentReadyResources = player.opponent.resources.filter((resource) => !resource.exhausted);

        if (opponentReadyResources.length === 1) {
            event.card = opponentReadyResources[0];
            return;
        }

        // randomly select a ready resource if possible; otherwise randomly select from all resources
        const resourcesToChooseFrom = opponentReadyResources.length > 0 ? opponentReadyResources : player.opponent.resources;
        event.card = Helpers.randomItem(resourcesToChooseFrom, context.game.randomGenerator);
    }

    private playerFromArray(player: Player | Player[]) {
        if (!Array.isArray(player)) {
            return player;
        }

        Contract.assertArraySize(player, 1, `TakeControlOfResourceSystem must have exactly one player target, instead found ${player.length}`);
        return player[0];
    }
}
