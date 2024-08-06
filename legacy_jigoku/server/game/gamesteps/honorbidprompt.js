const { CalculateHonorLimit } = require('../GameActions/Shared/HonorLogic.js');
const { AllPlayerPrompt } = require('./AllPlayerPrompt.js');
const { TransferHonorAction } = require('../GameActions/TransferHonorAction');
const { EventNames, EffectNames } = require('../Constants');
const { GameModes } = require('../../GameModes.js');

class HonorBidPrompt extends AllPlayerPrompt {
    constructor(game, menuTitle, costHandler, prohibitedBids = {}, duel = null, raiseEvent = true) {
        super(game);
        this.menuTitle = menuTitle || 'Choose a bid';
        this.costHandler = costHandler;
        this.prohibitedBids = prohibitedBids;
        this.duel = duel;
        this.bid = {};
        this.raiseEvent = raiseEvent;
    }

    activeCondition(player) {
        return !this.bid[player.uuid];
    }

    completionCondition(player) {
        return this.bid[player.uuid] > 0;
    }

    continue() {
        let completed = super.continue();

        if(completed) {
            const eventName = this.raiseEvent ? EventNames.OnHonorDialsRevealed : EventNames.Unnamed;
            const eventProps = { duel: this.duel, isHonorBid: typeof this.costHandler !== 'function' };
            this.game.raiseEvent(eventName, eventProps, () => {
                for(const player of this.game.getPlayers()) {
                    player.honorBidModifier = 0;
                    this.game.actions
                        .setHonorDial({ value: this.bid[player.uuid] })
                        .resolve(player, this.game.getFrameworkContext());
                }
            });
            if (this.duel) {
                this.game.raiseEvent(EventNames.OnDuelFocus, eventProps);
            }
            if(this.costHandler) {
                this.game.queueSimpleStep(() => this.costHandler(this));
            } else {
                this.game.queueSimpleStep(() => this.transferHonorAfterBid());
            }
        }

        return completed;
    }

    transferHonorAfterBid(context = this.game.getFrameworkContext()) {
        let firstPlayer = this.game.getFirstPlayer();
        if(!firstPlayer.opponent) {
            return;
        }
        let difference = firstPlayer.honorBid - firstPlayer.opponent.honorBid;
        if(difference === 0) {
            return;
        }
        let amount = Math.abs(difference);
        let givingPlayer = difference > 0 ? firstPlayer : firstPlayer.opponent;
        let receivingPlayer = givingPlayer.opponent;

        const modifyGivenAmount = givingPlayer.getEffects(EffectNames.ModifyHonorTransferGiven).reduce((a, b) => a + b, 0);
        const modifyReceivedAmount = receivingPlayer.getEffects(EffectNames.ModifyHonorTransferReceived).reduce((a, b) => a + b, 0);
        amount = amount + modifyGivenAmount + modifyReceivedAmount;

        var [, amountToTransfer] = CalculateHonorLimit(receivingPlayer, context.game.roundNumber, context.game.currentPhase, amount);
        this.game.addMessage('{0} gives {1} {2} honor', givingPlayer, receivingPlayer, amountToTransfer);
        const gameAction = new TransferHonorAction({ amount: Math.abs(difference), afterBid: true });
        gameAction.resolve(givingPlayer, context);
    }


    activePrompt(player) {
        let buttons = ['1', '2', '3', '4', '5'];
        if(this.game.gameMode === GameModes.Skirmish) {
            buttons = ['1', '2', '3'];
        }

        let prohibitedBids = this.prohibitedBids[player.uuid] || [];
        buttons = buttons.filter(num => !prohibitedBids.includes(num));
        return {
            promptTitle: 'Honor Bid',
            menuTitle: this.menuTitle,
            buttons: buttons.map(num => ({ text: num, arg: num }))
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to choose a bid.' };
    }

    menuCommand(player, bid) {
        this.game.addMessage('{0} has chosen a bid.', player);

        this.bid[player.uuid] = parseInt(bid);

        return true;
    }
}

module.exports = HonorBidPrompt;