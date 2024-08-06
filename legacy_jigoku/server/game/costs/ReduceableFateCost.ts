import { AbilityContext } from '../AbilityContext';
import { EventNames, Locations, Players } from '../Constants';
import type { Cost, Result } from '../Costs';
import { Event } from '../Events/Event';
import { removeFate } from '../GameActions/GameActions';
import BaseCard from '../basecard';
import Ring from '../ring';

const CANCELLED = 'CANCELLED';
const STOP = 'STOP';

type PoolOption = BaseCard | Ring | typeof CANCELLED | typeof STOP;
type Props = {
    reducedCost: number;
    remainingPoolTotal: number;
    minFate?: number;
    maxFate?: number;
    pool?: PoolOption;
    numberOfChoices?: number;
};

export class ReduceableFateCost implements Cost {
    public isPlayCost = true;
    public isPrintedFateCost = true;
    constructor(public ignoreType: boolean) {}

    public canPay(context: AbilityContext): boolean {
        if (context.source.printedCost === null) {
            return false;
        }

        const minCost = context.player.getMinimumCost(context.playType, context, null, this.ignoreType);
        if (minCost === 0) {
            return true;
        }

        if (context.source.isTemptationsMaho()) {
            return false;
        }

        return context.player.fate >= minCost && context.player.checkRestrictions('spendFate', context);
    }

    protected getAlternateFatePools(context: AbilityContext): Set<BaseCard | Ring> {
        return new Set(context.player.getAlternateFatePools(context.playType, context.source, context));
    }

    public resolve(context: AbilityContext, result: Result): void {
        const alternatePools = this.getAlternateFatePools(context);

        const ringPool = new Set<Ring>();
        const cardPool = new Set<BaseCard>();
        let alternatePoolTotal = 0;
        for (const pool of alternatePools) {
            if (pool.printedType === 'ring') {
                ringPool.add(pool as Ring);
            } else {
                cardPool.add(pool as BaseCard);
            }
            alternatePoolTotal += pool.getFate();
        }

        const maxPlayerFate = this.#getMaxPlayerFate(context);
        const reducedCost = this.getReducedCost(context);
        if (reducedCost > maxPlayerFate + alternatePoolTotal) {
            result.cancelled = true;
            return;
        }

        if (result.cancelled || alternatePools.size === 0) {
            return;
        }

        const properties: Props = {
            reducedCost: reducedCost,
            remainingPoolTotal: alternatePoolTotal
        };
        context.costs.alternateFate = new Map();
        if (properties.reducedCost === 0) {
            return;
        }

        const handler = (alternatePool: PoolOption) => {
            if (alternatePool === CANCELLED) {
                result.cancelled = true;
                return;
            }
            if (alternatePool === STOP) {
                return;
            }
            context.game.queueSimpleStep(() => {
                const altFate = alternatePool.getFate();
                properties.remainingPoolTotal -= altFate;
                properties.minFate = Math.max(
                    properties.reducedCost - maxPlayerFate - properties.remainingPoolTotal,
                    0
                );
                properties.maxFate = Math.min(altFate, properties.reducedCost);
                properties.pool = alternatePool;
                properties.numberOfChoices = properties.maxFate - properties.minFate + 1;
                if (result.cancelled || properties.numberOfChoices === 0) {
                    return;
                }
                const choiceHandler = () => {
                    alternatePools.delete(alternatePool);
                    if (alternatePools.size > 0 && properties.reducedCost > 0) {
                        this.promptForAlternateFateCardSelect(
                            context,
                            properties.reducedCost - maxPlayerFate,
                            alternatePools,
                            handler
                        );
                    }
                };
                this.promptForAlternateFate(context, result, properties, choiceHandler);
            });
        };

        for (const alternatePool of ringPool) {
            context.game.queueSimpleStep(() => {
                properties.remainingPoolTotal -= alternatePool.getFate();
                properties.minFate = Math.max(
                    properties.reducedCost - maxPlayerFate - properties.remainingPoolTotal,
                    0
                );
                properties.maxFate = Math.min(alternatePool.getFate(), properties.reducedCost);
                properties.pool = alternatePool;
                properties.numberOfChoices = properties.maxFate - properties.minFate + 1;
                if (result.cancelled || properties.numberOfChoices === 0) {
                    return;
                }
                this.promptForAlternateFate(context, result, properties);
            });
        }

        if (cardPool.size > 0) {
            this.promptForAlternateFateCardSelect(context, properties.reducedCost - maxPlayerFate, cardPool, handler);
        }
    }

    protected getReducedCost(context: AbilityContext): number {
        return context.player.getReducedCost(context.playType, context.source, null, this.ignoreType);
    }

    protected getFinalFatecost(context: AbilityContext, reducedCost: number) {
        if (!context.costs.alternateFate) {
            return reducedCost;
        }
        let totalAlternateFate = 0;
        for (const alternatePool of this.getAlternateFatePools(context)) {
            const amount: number = context.costs.alternateFate.get(alternatePool);
            if (amount) {
                context.game.addMessage(
                    '{0} takes {1} fate from {2} to pay the cost of {3}',
                    context.player,
                    amount,
                    alternatePool,
                    context.source
                );
                removeFate({ amount }).resolve(alternatePool, context);
                totalAlternateFate += amount;
            }
        }
        return Math.max(reducedCost - totalAlternateFate, 0);
    }

    private promptForAlternateFateCardSelect(
        context: AbilityContext,
        minFate: number,
        cards: Set<BaseCard | Ring>,
        handler: (alternatePool: PoolOption) => void
    ) {
        const currentCard = context.source;
        const buttons = [{ text: 'Cancel', arg: CANCELLED }];
        if (minFate <= 0) {
            buttons.push({ text: 'Done', arg: STOP });
        }
        const waitingPromptTitle =
            context.ability.abilityType === 'action'
                ? 'Waiting for opponent to take an action or pass'
                : 'Waiting for opponent';

        context.game.promptForSelect(context.player, {
            activePromptTitle: `Choose a card to help pay the fate cost of ${currentCard.name}`,
            waitingPromptTitle,
            context,
            location: Locations.PlayArea,
            controller: Players.Self,
            buttons,
            cardCondition: (card) => cards.has(card),
            onSelect: (player, card) => {
                handler(card);
                return true;
            },
            onCancel: () => {
                handler(CANCELLED);
                return true;
            },
            onMenuCommand: (player, arg) => {
                handler(arg);
                return true;
            }
        });
    }

    private promptForAlternateFate(
        context: AbilityContext,
        result: Result,
        properties: Props,
        handler?: (choice: string) => void
    ) {
        const choices: Array<number | string> = Array.from(
            { length: properties.numberOfChoices },
            (_, idx) => idx + properties.minFate
        );
        if (result.canCancel) {
            choices.push('Cancel');
        }
        if (properties.maxFate === 0) {
            context.costs.alternateFate.set(properties.pool, 0);
            return;
        }

        if (typeof properties.pool === 'string') {
            return;
        }

        context.player.setSelectableCards([properties.pool]);
        context.game.promptWithHandlerMenu(context.player, {
            activePromptTitle: `Choose amount of fate to spend from ${properties.pool.name}`,
            choices: choices,
            choiceHandler: (choice: string) => {
                context.player.clearSelectableCards();

                if (choice === 'Cancel') {
                    result.cancelled = true;
                    return;
                }

                context.costs.alternateFate.set(properties.pool, choice);
                properties.reducedCost -= parseInt(choice, 10);

                if (handler) {
                    handler(choice);
                }
            }
        });
    }

    /**
     * USED FOR EXTENDING THIS CLASS
     */
    protected afterPayHook(event: any): void {}

    public payEvent(context: AbilityContext): Event {
        const amount = this.getReducedCost(context);
        context.costs.fate = amount;
        return new Event(EventNames.OnSpendFate, { amount, context }, (event) => {
            event.context.player.markUsedReducers(context.playType, event.context.source);
            event.context.player.fate -= this.getFinalFatecost(context, amount);
            this.afterPayHook(event);
        });
    }

    #getMaxPlayerFate(context: AbilityContext): number {
        if (context.source.isTemptationsMaho()) {
            return 0;
        }
        if (context.player.checkRestrictions('spendFate', context)) {
            return context.player.fate;
        }
        return 0;
    }
}