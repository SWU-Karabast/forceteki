import { ExhaustSystem } from '../../gameSystems/ExhaustSystem';
import type { AbilityContext } from '../ability/AbilityContext';
import { CardTargetResolver } from '../ability/abilityTargets/CardTargetResolver';
import type { Card } from '../card/Card';
import type { ICardWithCostProperty } from '../card/propertyMixins/Cost';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import { EventName, RelativePlayer, TargetMode, WildcardCardType } from '../Constants';
import type Game from '../Game';
import type { ICanAdjustProperties, IModifyPayStageCostAdjusterProperties } from './CostAdjuster';
import { CostAdjuster, CostAdjustType } from './CostAdjuster';
import * as Contract from '../utils/Contract.js';
import * as Helpers from '../utils/Helpers.js';
import type { ICostResult } from './ICost';
import type { PlayCardResourceCost } from '../../costs/PlayCardResourceCost';
import { GameEvent } from '../event/GameEvent';

export interface IExhaustUnitsCostAdjusterProperties<TContext extends AbilityContext> extends Omit<IModifyPayStageCostAdjusterProperties, 'costAdjustType'> {
    cardCondition: (card: IUnitCard, context: TContext) => boolean;
}

export class ExhaustUnitCostAdjuster extends CostAdjuster {
    private numExhaustedUnits?: number = null;
    private finalCost?: number = null;

    private readonly targetResolver: CardTargetResolver;
    private readonly exhaustSystem: ExhaustSystem;
    private readonly cardCondition: (card: IUnitCard, context: AbilityContext) => boolean;

    public constructor(
        game: Game,
        source: ICardWithCostProperty,
        properties: IExhaustUnitsCostAdjusterProperties<AbilityContext>
    ) {
        super(game, source,
            {
                ...properties,
                costAdjustType: CostAdjustType.ModifyPayStage,
                matchAbilityCosts: true,
                amount: (_card, _player, _context, currentAmount) => -(this.numExhaustedUnits ?? 0)
            }
        );

        this.exhaustSystem = new ExhaustSystem({ isCost: true });
        this.cardCondition = properties.cardCondition;
        this.targetResolver = new CardTargetResolver(
            'exhaustUnitsCostAdjuster', {
                mode: TargetMode.UpToVariable,
                numCardsFunc: (context) => this.getMaxExhaustableCount(context),
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && this.cardCondition(card, context),
                immediateEffect: this.exhaustSystem,
                controller: RelativePlayer.Self,
                appendToDefaultTitle: 'to exhaust as if they were resources',
            }
        );
    }

    public override canAdjust(card: Card, context: AbilityContext<ICardWithCostProperty>, adjustParams: ICanAdjustProperties) {
        // if we haven't yet resolved the exhaust targets, just check if there are any legal targets
        if (this.numExhaustedUnits == null && !this.targetResolver.hasLegalTarget(context)) {
            return false;
        }

        return super.canAdjust(card, context, adjustParams);
    }

    public override queueGenerateEventGameSteps(
        events: any[],
        context: AbilityContext<ICardWithCostProperty>,
        resourceCost: PlayCardResourceCost,
        result?: ICostResult
    ) {
        Contract.assertIsNullLike(this.numExhaustedUnits);

        // Get final cost before any adjustments from this cost adjuster
        const preAdjustedCost = resourceCost.getAdjustedCost(context);
        this.finalCost = preAdjustedCost;

        const maxExhaustableCount = this.getMaxExhaustableCount(context);

        // if no exhaustable units, shortcut past exploit prompt
        if (maxExhaustableCount === 0) {
            this.numExhaustedUnits = 0;
            return;
        }

        const canPlayWithoutExhausting = preAdjustedCost <= context.player.readyResourceCount;

        // If exhausting units is the only way the player can pay the cost, skip straight to unit selection
        if (!result.canCancel && !canPlayWithoutExhausting) {
            this.resolveExhaust(events, context, result);
            return;
        }

        const choices = ['Pay cost by exhausting units'];
        const handlers = [
            () => this.resolveExhaust(events, context, result)
        ];

        if (result.canCancel) {
            choices.push('Cancel');
            handlers.push(() => {
                result.cancelled = true;
                this.resetForCancel();
            });
        }

        // add normal play option if available
        if (canPlayWithoutExhausting) {
            choices.unshift('Pay cost normally');
            handlers.unshift(() => {
                this.numExhaustedUnits = 0;
            });
        }

        context.game.promptWithHandlerMenu(context.player, {
            activePromptTitle: `Choose pay mode for ${context.source.title}`,
            choices,
            handlers
        });
    }

    private resolveExhaust(events: any[], context: AbilityContext, result: ICostResult) {
        // step 1: ask player to choose defeat targets
        this.targetResolver.resolve(context, result);

        // step 2: generate the Exploit event (which in turn emits the defeat events)
        context.game.queueSimpleStep(() => {
            if (!result.cancelled) {
                this.numExhaustedUnits = Helpers.asArray(context.targets.exhaustUnitsCostAdjuster).length;
                events.push(this.buildExhaustEvent(context));
            }
        }, `generate exhaustUnitsCostAdjuster event for ${context.source.internalName}`);
    }

    private buildExhaustEvent(context) {
        Contract.assertNotNullLike(context.targets.exhaustUnitsCostAdjuster);

        const payEvents = [];
        const targets = Helpers.asArray(context.targets.exhaustUnitsCostAdjuster);

        // create the events for exhausting the selected units
        for (const unit of targets) {
            payEvents.push(this.exhaustSystem.generateRetargetedEvent(unit, context));
        }

        const exhaustEvent = new GameEvent(
            EventName.OnExhaustUnitsToPayCost,
            context,
            { units: targets }
        );

        exhaustEvent.setContingentEventsGenerator((event) => {
            for (const payEvent of payEvents) {
                payEvent.order = event.order - 1;
            }
            return [...payEvents];
        });

        return exhaustEvent;
    }

    public resetForCancel() {
        // reset the cost adjuster so it can be used again after a cancel
        this.finalCost = null;
        this.numExhaustedUnits = null;
    }

    private getMaxExhaustableCount(context: AbilityContext): number {
        // Arbitrarily default to nonzero number to determine if there are targets to exhaust
        const cost = this.finalCost ?? 1;
        return Math.min(cost, this.targetResolver.getAllLegalTargets(context).length);
    }
}