import type { AbilityContext } from '../core/ability/AbilityContext';
import { DamageType, EventName } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { DamageSystem } from './DamageSystem';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import type { GameEvent } from '../core/event/GameEvent';
import { Contract } from '../core/utils/Contract';
import { Helpers } from '../core/utils/Helpers';
import type { FormatMessage } from '../core/chat/GameChat';

export interface IDrawProperties extends IPlayerTargetSystemProperties {
    amount?: number;
}

export class DrawSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDrawProperties> {
    public override readonly name = 'draw';
    public override readonly eventName = EventName.OnCardsDrawn;

    protected override defaultProperties: IDrawProperties = {
        amount: 1
    };

    public eventHandler(event): void {
        const gameEvent = event as GameEvent;
        Contract.assertNotNullLike(gameEvent.context);
        Contract.assertNotNullLike(gameEvent.context.player);

        if (event.player === gameEvent.context.player && event.amount > 0 && event.player.drawDeck.length > 0) {
            gameEvent.context.game.snapshotManager.setRequiresConfirmationToRollbackCurrentSnapshot(gameEvent.context.player.id);
        }

        event.cards = event.player.drawDeck.slice(0, event.amount);
        event.player.drawCardsToHand(event.amount);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const effects: FormatMessage[] = Helpers.asArray(properties.target).map((target) => {
            const cardAmount = ChatHelpers.pluralize(properties.amount, 'a card', 'cards');
            if (target === context.player) {
                return {
                    format: 'draw {0}',
                    args: [cardAmount],
                };
            }
            return {
                format: 'make {0} draw {1}',
                args: [target, cardAmount],
            };
        });
        return [ChatHelpers.formatWithLength(effects.length, 'to '), effects];
    }

    public override canAffectInternal(player: Player, context: TContext, additionalProperties: Partial<IDrawProperties> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.amount !== 0 && super.canAffectInternal(player, context);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties: Partial<IDrawProperties>): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
    }

    protected override updateEvent(event, player: Player, context: TContext, additionalProperties: Partial<IDrawProperties>): void {
        super.updateEvent(event, player, context, additionalProperties);

        // TODO: convert damage on draw to be a real replacement effect once we have partial replacement working
        event.setContingentEventsGenerator((event) => {
            // Add a contingent event to deal damage for any cards the player fails to draw due to not having enough left in their deck.
            const contingentEvents = [];
            if (event.amount > event.player.drawDeck.length) {
                const cannotDrawCount = event.amount - event.player.drawDeck.length;
                const damageAmount = 3 * cannotDrawCount;

                context.game.addMessage('{0} attempts to draw {1} cards from their empty deck and takes {2} damage instead',
                    event.player, cannotDrawCount, damageAmount
                );

                // Here we generate a damage event with a new context that contains just the player,
                // this way the damage is attributed to the player and not the card that triggered the draw (or its controller).
                // As per rules, the player that is drawing is also the player that is causing the damage and
                // this is important for cards like Forced Surrender. (FFG ruling confirms this)
                // The downside is that we lose any connection with the original card that triggered the draw,
                // which shouldn't matter for any of the existing cards.
                contingentEvents.push(new DamageSystem({
                    type: DamageType.Ability,
                    target: event.player.base,
                    amount: damageAmount
                }).generateEvent(context.game.getFrameworkContext(event.player)));
            }
            return contingentEvents;
        });
    }
}
