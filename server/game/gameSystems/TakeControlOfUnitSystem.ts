import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
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
    public override readonly effectDescription = 'take control of {0}';
    protected override readonly targetTypeFilter = [WildcardCardType.Unit];

    protected override eventHandlerInternal(event): void {
        event.card.takeControl(event.newController);

        for (const upgrade of event.card.upgrades.filter((u) => u.isTokenUpgrade())) {
            upgrade.takeControl(event.newController);
        }
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: ITakeControlOfUnitProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!card.canBeInPlay() || !card.isInPlay()) {
            return false;
        }

        if (
            mustChangeGameState !== GameStateChangeRequired.None && (
                properties.newController === card.controller ||
                properties.excludeLeaderUnit && card.isLeader()
            )
        ) {
            return false;
        }

        return super.canAffectInternal(card, context, properties, GameStateChangeRequired.None);
    }

    protected override getEffectMessageInternal(context: TContext, properties: ITakeControlOfUnitProperties): [string, any[]] {
        const { newController, target } = properties;
        if (newController === context.player) {
            return super.getEffectMessageInternal(context, properties);
        }
        return ['give control of {0} to {1}', [this.getTargetMessage(target, context), newController]];
    }

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, properties: ITakeControlOfUnitProperties): void {
        super.addPropertiesToEvent(event, card, context, properties);

        event.newController = properties.newController;
    }

    protected override updateEvent(event, player: Player, context: TContext, properties: ITakeControlOfUnitProperties, additionalProperties: Partial<IGameSystemInput<ITakeControlOfUnitProperties>> = {}): void {
        super.updateEvent(event, player, context, properties, additionalProperties);

        // By rule, leader units are always defeated instead of changing control (CR 3.4.6)
        event.setReplacementEventsGenerator((event) => {
            if (event.card.isLeader() && event.newController !== event.card.controller) {
                context.game.addMessage(
                    '{0} would take control of {1}, but it is a leader unit so it is defeated instead',
                    event.newController, this.getTargetMessage(event.card, context)
                );

                return [
                    new FrameworkDefeatCardSystem({
                        defeatSource: DefeatSourceType.FrameworkEffect,
                        target: event.card
                    }).generateEvent(context.game.getFrameworkContext(event.player))
                ];
            }
            return [];
        });
    }

    protected override prepareProperties(context: TContext, properties: ITakeControlOfUnitProperties): void {
        super.prepareProperties(context, properties);

        // By default, we exclude leader units from participating in this system, but there are some cases where we need to allow it
        // (e.g. when a unit becomes a leader unit after control changes, due to piloting)
        properties.excludeLeaderUnit = properties.excludeLeaderUnit ?? true;
    }
}
