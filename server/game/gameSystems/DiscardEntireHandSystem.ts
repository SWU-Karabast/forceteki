import { EventName, ZoneName } from '../core/Constants';
import type { AbilityContext } from '../core/ability/AbilityContext';
import * as Helpers from '../core/utils/Helpers.js';
import type Player from '../core/Player';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDiscardEntireHandSystemProperties extends IPlayerTargetSystemProperties {}

/**
 * A {@link GameSystem} which discards a player's entire hand.
 *
 * By default, this system will target the opponent of the player who initiated the ability.
 */
export class DiscardEntireHandSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscardEntireHandSystemProperties> {
    public override name = 'discardEntireHand';
    public override eventName = EventName.OnEntireHandDiscarded;
    public override readonly costDescription: string = 'discard hand';
    public override readonly effectDescription: string = 'discard hand';

    public override eventHandler(): void {
        // Do nothing
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties: Record<string, any> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        for (const player of Helpers.asArray(properties.target) as Player[]) {
            // TODO: Understand if checking canAffect here is necessary or not. The superclass implementation does this
            // so it seems a good idea to do it here as well but we should understand if it's really necessary or not.

            // Ensure that the player can be affected by this system
            if (!this.canAffect(player, context, additionalProperties)) {
                continue;
            }

            // Discard each card in the player's hand
            for (const card of player.getCardsInZone(ZoneName.Hand)) {
                const discardCardEvent = new DiscardSpecificCardSystem({ target: card }).generateEvent(context);
                events.push(discardCardEvent);
            }

            // Generate one final event to convey that the player's entire hand was discarded
            events.push(this.generateRetargetedEvent(player, context, additionalProperties));
        }
    }
}