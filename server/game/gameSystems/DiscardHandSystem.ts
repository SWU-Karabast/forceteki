import { EventName, Location } from '../core/Constants';
import { AbilityContext } from '../core/ability/AbilityContext';
import * as Helpers from '../core/utils/Helpers.js';
import type Player from '../core/Player';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDiscardHandSystemProperties extends IPlayerTargetSystemProperties {}

/**
 * A {@link GameSystem} which discards a player's entire hand
 */
export class DiscardHandSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscardHandSystemProperties> {
    public override name = 'discardHand';
    public override eventName = EventName.OnHandDiscarded;
    public override readonly costDescription: string = 'discard hand';
    public override readonly effectDescription: string = 'discard hand';

    public override eventHandler(event): void {
        const players = Helpers.asArray(event.player) as Player[];

        players.forEach((player) =>
            player
                .getCardPile(Location.Hand)
                .forEach((card) => player.moveCard(card, Location.Discard))
        );
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }
}