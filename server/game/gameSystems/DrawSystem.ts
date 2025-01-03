import type { AbilityContext } from '../core/ability/AbilityContext';
import { DamageType, EventName } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type Player from '../core/Player';
import { DamageSystem } from './DamageSystem';

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
        event.player.drawCardsToHand(event.amount);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['draw ' + properties.amount + (properties.amount > 1 ? ' cards' : ' card'), []];
    }

    public override canAffect(player: Player, context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return properties.amount !== 0 && super.canAffect(player, context);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties): void {
        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.cards = event.player.drawDeck.slice(0, amount);
        event.amount = amount;
    }

    protected override updateEvent(event, player: Player, context: TContext, additionalProperties): void {
        super.updateEvent(event, player, context, additionalProperties);

        // TODO: convert damage on draw to be a real replacement effect once we have partial replacement working
        event.setContingentEventsGenerator((event) => {
            // Add a contingent event to deal damage for any cards the player fails to draw due to not having enough left in their deck.
            const contingentEvents = [];
            if (event.amount > event.player.drawDeck.length) {
                const damageAmount = 3 * (event.amount - event.player.drawDeck.length);

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
