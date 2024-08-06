import type { AbilityContext } from '../AbilityContext';
import type Game from '../game';
import { JointGameAction } from '../GameActions/JointGameAction';
import { LoseFateAction } from '../GameActions/LoseFateAction';
import type Player from '../player';
import { AllPlayerPrompt } from './AllPlayerPrompt';

export type Result = {
    bids: Map<Player, number>;
    highest: { amount: number; players: Set<Player> };
    lowest: { amount: number; players: Set<Player> };
};

export class FateBidPrompt extends AllPlayerPrompt {
    bids = new Map<Player, number>();
    menuTitle: string;

    constructor(
        game: Game,
        menuTitle: string,
        private bidHandler: (result: Result, context: AbilityContext) => void,
        private prohibitedBids: Record<string, Array<number>> = {}
    ) {
        super(game);
        this.menuTitle = menuTitle || 'Choose a bid';
    }

    activeCondition(player: Player) {
        return !this.bids.has(player);
    }

    completionCondition(player: Player) {
        return this.bids.has(player);
    }

    continue() {
        if (!super.continue()) {
            return false;
        }

        const result: Result = {
            bids: this.bids,
            highest: { amount: 0, players: new Set() },
            lowest: { amount: 0, players: new Set() }
        };
        for (const [player, amount] of this.bids) {
            if (amount > result.highest.amount) {
                result.highest.amount = amount;
                result.highest.players = new Set([player]);
            } else if (amount === result.highest.amount) {
                result.highest.players.add(player);
            }
            if (amount < result.lowest.amount) {
                result.lowest.amount = amount;
                result.lowest.players = new Set([player]);
            } else if (amount === result.lowest.amount) {
                result.lowest.players.add(player);
            }
        }

        const context = this.game.getFrameworkContext();
        // @ts-ignore
        context.fateBidResult = result;

        this.game.queueSimpleStep(() => this.bidHandler(result, context));

        return true;
    }

    spendFateAfterBid() {
        const actions: Array<LoseFateAction> = [];
        const context = this.game.getFrameworkContext();
        for (const [player, amount] of this.bids) {
            this.game.addMessage('{0} spends {1} fate', player, amount);
            actions.push(new LoseFateAction({ amount, target: player }));
        }
        new JointGameAction(actions).resolve(undefined, context);
    }

    activePrompt(player: Player) {
        const prohibitedBids = this.prohibitedBids[player.uuid] || [];
        const buttons: Array<{ text: string; arg: string }> = [];
        for (let i = 0, max = player.fate; i <= max; i++) {
            if (!prohibitedBids.includes(i)) {
                const text = i.toString();
                buttons.push({ text, arg: text });
            }
        }

        return {
            promptTitle: 'How much fate to spend?',
            menuTitle: this.menuTitle,
            buttons: buttons
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to decide how much fate to spend.' };
    }

    menuCommand(player: Player, bid: string) {
        const parsed = parseInt(bid, 10);
        const amount = isNaN(parsed) ? 0 : parsed;

        this.game.addMessage('{0} has decided how much fate to spend.', player);
        this.bids.set(player, amount);
        return true;
    }
}
