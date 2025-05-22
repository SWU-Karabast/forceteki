import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { GameStateChangeRequired, EventName, WildcardCardType } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { Player } from '../core/Player';
import { DefeatSourceType } from '../IDamageOrDefeatSource';
import { FrameworkDefeatCardSystem } from './FrameworkDefeatCardSystem';

export interface ITakeControlOfUnitProperties extends ICardTargetSystemProperties {
    newController: Player;

    /**
     * Whether the system should exclude leader units from being affected. Defaults to `true`.
     *
     * This usually only applies when control changes due to a delayed effect. Leader
     * units are always defeated instead of changing control.
     */
    excludeLeaderUnit?: boolean;
}

/**
 * Used for taking control of a unit in the arena
 */
export class TakeControlOfUnitSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ITakeControlOfUnitProperties> {
    public override readonly name = 'takeControl';
    public override readonly eventName = EventName.OnTakeControl;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit];

    public eventHandler(event): void {
        event.card.takeControl(event.newController);
    }

    public override canAffectInternal(card: Card, context: TContext, _additionalProperties: Partial<ITakeControlOfUnitProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.canBeInPlay() || !card.isInPlay()) {
            return false;
        }

        const properties = this.generatePropertiesFromContext(context);

        if (mustChangeGameState !== GameStateChangeRequired.None && properties.newController === card.controller) {
            return false;
        }

        if (mustChangeGameState !== GameStateChangeRequired.None && properties.excludeLeaderUnit && card.isLeader()) {
            return false;
        }

        return super.canAffectInternal(card, context);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { newController, target } = this.generatePropertiesFromContext(context);
        if (newController === context.player) {
            return ['take control of {0}', [target]];
        }
        return ['give control of {0} to {1}', [target, newController]];
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<ITakeControlOfUnitProperties>): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context);

        event.newController = properties.newController;
        event.excludeLeaderUnit = properties.excludeLeaderUnit;
    }

    protected override updateEvent(event, player: Player, context: TContext, additionalProperties: Partial<ITakeControlOfUnitProperties>): void {
        super.updateEvent(event, player, context, additionalProperties);

        event.setContingentEventsGenerator((event) => {
            // Add a contingent event to defeat the unit if it is a leader unit
            const contingentEvents = [];

            if (event.card.isLeader() && event.newController !== event.card.controller) {
                contingentEvents.push(new FrameworkDefeatCardSystem({
                    defeatSource: DefeatSourceType.FrameworkEffect,
                    target: event.card
                }).generateEvent(context.game.getFrameworkContext(event.player)));
            }

            return contingentEvents;
        });
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties?: Partial<ITakeControlOfUnitProperties>): ITakeControlOfUnitProperties {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        // By default, we exclude leader units from participating in this system, but there are some cases where we need to allow it
        // (e.g. when a unit becomes a leader unit after control changes, due to piloting)
        properties.excludeLeaderUnit = properties.excludeLeaderUnit ?? true;

        return properties;
    }
}
