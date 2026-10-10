import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import { GameStateChangeRequired } from '../core/Constants';
import { EnumHelpers } from '../core/utils/EnumHelpers.js';
import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { EffectName, EventName } from '../core/Constants.js';
import type { GameEvent } from '../core/event/GameEvent.js';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem.js';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem.js';
import type { Player } from '../core/Player.js';
import { DistributeIndirectDamageToCardsSystem } from './DistributeIndirectDamageToCardsSystem.js';
import type { IndirectDamageModifier } from '../core/ongoingEffect/effectImpl/IndirectDamageModifier.js';

export interface IIndirectDamageToPlayerProperties extends IPlayerTargetSystemProperties {
    amount: number;
}

export class IndirectDamageToPlayerSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IIndirectDamageToPlayerProperties> {
    public override readonly name = 'indirectDamageToPlayer';
    public override readonly eventName = EventName.OnIndirectDamageDealtToPlayer;

    protected override defaultProperties: IGameSystemInput<IIndirectDamageToPlayerProperties> = {
        amount: null,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override eventHandlerInternal(): void {}

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: IIndirectDamageToPlayerProperties, additionalProperties: Partial<IGameSystemInput<IIndirectDamageToPlayerProperties>> = {}): void {
        super.queueGenerateEventGameStepsInternal(events, context, properties, additionalProperties);

        const indirectDamageAmount = this.calculateIndirectDamageAmount(properties.amount, context, properties.target[0]);

        const choosingPlayer = EnumHelpers.asRelativePlayer(properties.target[0], context.player);

        new DistributeIndirectDamageToCardsSystem({
            amountToDistribute: indirectDamageAmount,
            player: choosingPlayer,
        }).queueGenerateEventGameSteps(events, context);
    }

    private calculateIndirectDamageAmount(baseAmount: number, context: TContext, targetPlayer: Player): number {
        return context.player
            .getOngoingEffectValues<IndirectDamageModifier>(EffectName.ModifyIndirectDamage)
            .reduce((totalIndirectDamage, value) =>
                totalIndirectDamage + (value.opponentsOnly && context.player === targetPlayer ? 0 : value.amount),
            baseAmount + context.pendingAbilityDamageIncrease);
    }

    protected override getEffectMessageInternal(context: TContext, properties: IIndirectDamageToPlayerProperties): [string, any[]] {
        const indirectDamageAmount = this.calculateIndirectDamageAmount(properties.amount, context, properties.target[0]);

        return ['deal {0} indirect damage to {1}', [indirectDamageAmount, this.getTargetMessage(properties.target, context)]];
    }

    protected override canAffectInternal(player: Player, context: TContext, properties: IIndirectDamageToPlayerProperties): boolean {
        if (properties.amount <= 0) {
            return false;
        }

        return super.canAffectInternal(player, context, properties, GameStateChangeRequired.None);
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player.opponent];
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, properties: IIndirectDamageToPlayerProperties): void {
        super.addPropertiesToEvent(event, player, context, properties);

        const { amount } = properties;

        event.amount = amount;
    }
}
