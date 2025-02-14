import * as EnumHelpers from '../core/utils/EnumHelpers.js';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type Player from '../core/Player';
import { DistributeIndirectDamageSystem } from './DistributeIndirectDamageSystem';

export interface IIndirectDamageProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class IndirectDamageSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IIndirectDamageProperties> {
    public override readonly name = 'indirectDamage';
    public override readonly eventName = EventName.OnIndirectDamageDealt;

    protected override defaultProperties: IIndirectDamageProperties = {
        amount: 1
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(): void {}

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties?: any): void {
        super.queueGenerateEventGameSteps(events, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        new DistributeIndirectDamageSystem({
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
