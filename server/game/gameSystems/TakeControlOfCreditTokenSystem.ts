import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameStateChangeRequired } from '../core/Constants';
import { EventName } from '../core/Constants';
import * as Helpers from '../core/utils/Helpers';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { Player } from '../core/Player';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { FormatMessage } from '../core/chat/GameChat';

export interface ITakeControlOfCreditTokenProperties extends IPlayerTargetSystemProperties {

    /** The number of tokens being taken. Defaults to 1. */
    amount?: number;

    /** The new controller of the credit token(s) */
    newController: Player;
}

export class TakeControlOfCreditTokenSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ITakeControlOfCreditTokenProperties> {
    public override readonly name = 'takeControl';
    public override readonly eventName = EventName.OnTakeControl;
    protected override readonly defaultProperties: ITakeControlOfCreditTokenProperties = {
        amount: 1,
        newController: null
    };

    public override eventHandler(event, additionalProperties: Partial<ITakeControlOfCreditTokenProperties>): void {
        const newController = event.newController as Player;
        const actualAmount = Math.min(event.amount, event.player.creditTokenCount);

        for (const credit of event.player.baseZone.credits.slice(0, actualAmount)) {
            credit.takeControl(newController);
        }
    }

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<ITakeControlOfCreditTokenProperties>): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const newController = properties.newController;
        const players = Helpers.asArray(properties.target);

        const effectMessage = (player: Player): FormatMessage => {
            const newControllerIsSelf = newController === context.player;
            const verb = newControllerIsSelf ? 'take' : 'give';
            const preposition = newControllerIsSelf ? 'from' : 'to';
            const objectOfPreposition = newControllerIsSelf ? player : newController;
            const actualAmount = Math.min(properties.amount, player.creditTokenCount);

            return {
                format: '{0} control of {1} {2} {3}',
                args: [verb, ChatHelpers.pluralize(actualAmount, 'a Credit token', 'Credit tokens'), preposition, objectOfPreposition]
            };
        };

        return [ChatHelpers.formatWithLength(players.length, 'to '), players.map((player) => effectMessage(player))];
    }

    public override canAffectInternal(
        target: Player | Player[],
        context: TContext,
        additionalProperties?: Partial<ITakeControlOfCreditTokenProperties>,
        mustChangeGameState?: GameStateChangeRequired
    ): boolean {
        const targets = Helpers.asArray(target);
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const wouldHaveNoEffect = properties.amount === 0 ||
          targets.every((p) => p.creditTokenCount === 0) ||
          targets.every((p) => p === properties.newController);

        if (mustChangeGameState !== GameStateChangeRequired.None && wouldHaveNoEffect) {
            return false;
        }

        return super.canAffectInternal(target, context, additionalProperties, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties?: Partial<ITakeControlOfCreditTokenProperties>): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        event.newController = properties.newController;
        event.amount = properties.amount;
    }
}