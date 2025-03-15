import * as EnumHelpers from '../core/utils/EnumHelpers.js';
import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { EffectName, EventName } from '../core/Constants.js';
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
        amount: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(): void {}

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties?: any): void {
        super.queueGenerateEventGameSteps(events, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const indirectDamageAmount = this.calculateIndirectDamageAmount(properties.amount, context);

        const choosingPlayer = EnumHelpers.asRelativePlayer(properties.target[0], context.player);

        new DistributeIndirectDamageToCardsSystem({
            amountToDistribute: indirectDamageAmount,
            player: choosingPlayer,
        }).queueGenerateEventGameSteps(events, context);
    }

    private calculateIndirectDamageAmount(baseAmount: number, context: TContext): number {
        let totalIndirectDamage = baseAmount;
        if (context.player.hasOngoingEffect(EffectName.ModifyIndirectDamage)) {
            context.player.getOngoingEffectValues(EffectName.ModifyIndirectDamage).forEach((value) => {
                totalIndirectDamage += value.amount;
            });
        }
        return totalIndirectDamage;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const indirectDamageAmount = this.calculateIndirectDamageAmount(properties.amount, context);

        return ['deal {0} indirect damage to {1}', [indirectDamageAmount, properties.target]];
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
