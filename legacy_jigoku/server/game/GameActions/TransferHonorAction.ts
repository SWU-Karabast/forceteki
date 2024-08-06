import type { AbilityContext } from '../AbilityContext';
import { EffectNames, EventNames } from '../Constants';
import type Player from '../player';
import { PlayerAction, type PlayerActionProperties } from './PlayerAction';
import { CalculateHonorLimit } from './Shared/HonorLogic';

export interface TransferHonorProperties extends PlayerActionProperties {
    amount?: number;
    afterBid?: boolean;
}

export class TransferHonorAction extends PlayerAction {
    name = 'takeHonor';
    eventName = EventNames.OnTransferHonor;
    defaultProperties: TransferHonorProperties = { amount: 1, afterBid: false };

    getAmountToTransfer(givingPlayer: Player, receivingPlayer: Player, context: AbilityContext, baseAmount: Number) {
        let amount = baseAmount;
        const modifyGivenAmount = givingPlayer
            .getEffects(EffectNames.ModifyHonorTransferGiven)
            .reduce((a, b) => a + b, 0);
        const modifyReceivedAmount = receivingPlayer
            .getEffects(EffectNames.ModifyHonorTransferReceived)
            .reduce((a, b) => a + b, 0);
        amount = amount + modifyGivenAmount + modifyReceivedAmount;

        var [_, amountToTransfer] = CalculateHonorLimit(
            receivingPlayer,
            context.game.roundNumber,
            context.game.currentPhase,
            amount
        );
        return amountToTransfer;
    }

    constructor(propertyFactory: TransferHonorProperties | ((context: AbilityContext) => TransferHonorProperties)) {
        super(propertyFactory);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as TransferHonorProperties;
        var amountToTransfer = this.getAmountToTransfer(
            context.player,
            context.player.opponent,
            context,
            properties.amount
        );
        return ['giving {1} honor to {2}', [amountToTransfer, context.player.opponent]];
    }

    getEffectMessage(context: AbilityContext): [string, any[]] {
        let properties = this.getProperties(context) as TransferHonorProperties;
        var amountToTransfer = this.getAmountToTransfer(
            context.player.opponent,
            context.player,
            context,
            properties.amount
        );
        return ['take {1} honor from {0}', [context.player.opponent, amountToTransfer]];
    }

    canAffect(player: Player, context: AbilityContext, additionalProperties = {}): boolean {
        let properties = this.getProperties(context, additionalProperties) as TransferHonorProperties;

        const gainsHonor = properties.amount > 0;
        if (!gainsHonor) return false;

        var [hasLimit, amountToTransfer] = CalculateHonorLimit(
            player.opponent,
            context.game.roundNumber,
            context.game.currentPhase,
            properties.amount
        );
        amountToTransfer = this.getAmountToTransfer(player, player.opponent, context, properties.amount);
        if (hasLimit && !amountToTransfer) return false;

        return player.opponent && super.canAffect(player, context);
    }

    addPropertiesToEvent(event, player: Player, context: AbilityContext, additionalProperties): void {
        let { afterBid, amount } = this.getProperties(context, additionalProperties) as TransferHonorProperties;
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
        event.afterBid = afterBid;
    }

    eventHandler(event): void {
        var amountToTransfer = this.getAmountToTransfer(
            event.player,
            event.player.opponent,
            event.context,
            event.amount
        );

        if (event.player && event.player.opponent) {
            event.player.modifyHonor(-amountToTransfer);
            event.player.opponent.modifyHonor(amountToTransfer);
        }
    }
}
