import * as EnumHelpers from '../core/utils/EnumHelpers.js';
import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { EventName } from '../core/Constants.js';
import type { GameEvent } from '../core/event/GameEvent.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type Player from '../core/Player.js';
import { DistributeIndirectDamageToCardsSystem } from './DistributeIndirectDamageToCardsSystem.js';

export interface IIndirectDamageToPlayerProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class IndirectDamageToPlayerSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IIndirectDamageToPlayerProperties> {
    public override readonly name = 'indirectDamageToPlayer';
    public override readonly eventName = EventName.OnIndirectDamageDealtToPlayer;

    protected override defaultProperties: IIndirectDamageToPlayerProperties = {
        amount: 1
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(): void {}

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties?: any): void {
        super.queueGenerateEventGameSteps(events, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        new DistributeIndirectDamageToCardsSystem({
            amountToDistribute: properties.amount,
            player: EnumHelpers.asRelativePlayer(properties.target[0], context.player),
        }).queueGenerateEventGameSteps(events, context);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        return ['deal {0} indirect damage to {1}', [properties.amount, properties.target]];
    }

    public override canAffect(player: Player, context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (properties.amount <= 0) {
            return false;
        }

        return super.canAffect(player, context);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player.opponent];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        const { amount } = this.generatePropertiesFromContext(context, additionalProperties);

        event.amount = amount;
    }
}
