import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { CardTypeFilter, ZoneFilter, RelativePlayerFilter } from '../core/Constants';
import { CardType, RelativePlayer, TargetMode, WildcardCardType } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import CardSelectorFactory from '../core/cardSelector/CardSelectorFactory';
import type BaseCardSelector from '../core/cardSelector/BaseCardSelector';
import type { GameEvent } from '../core/event/GameEvent';
import type { DistributePromptType, IDistributeAmongTargetsPromptProperties, IDistributeAmongTargetsPromptResults } from '../core/gameSteps/PromptInterfaces';
import type { DamageSystem } from './DamageSystem';
import type { HealSystem } from './HealSystem';
import * as Contract from '../core/utils/Contract';
import type { GiveExperienceSystem } from './GiveExperienceSystem';

export interface IDistributeAmongTargetsSystemProperties<TContext extends AbilityContext = AbilityContext> extends ICardTargetSystemProperties {
    amountToDistribute: number | ((context: TContext) => number);

    /**
     * If true, the player can choose to target 0 cards with the ability.
     * This needs to be set for any card that says "choose among any number of units" in its effect text.
     */
    canChooseNoTargets: boolean;

    /** If true, the amount distributed can be less than `amountToDistribute` */
    canDistributeLess?: boolean;

    activePromptTitle?: string;
    player?: RelativePlayer;
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    controller?: RelativePlayerFilter;
    zoneFilter?: ZoneFilter | ZoneFilter[];
    cardCondition?: (card: Card, context: TContext) => boolean;
    selector?: BaseCardSelector;
    maxTargets?: number;
}

export abstract class DistributeAmongTargetsSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDistributeAmongTargetsSystemProperties> {
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, CardType.Base];
    protected override defaultProperties: IDistributeAmongTargetsSystemProperties<TContext> = {
        amountToDistribute: null,
        cardCondition: () => true,
        canChooseNoTargets: null,
        canDistributeLess: this.canDistributeLessDefault(),
        maxTargets: null,
    };

    public abstract promptType: DistributePromptType;
    protected abstract generateEffectSystem(target?: Card, amount?: number): DamageSystem | HealSystem | GiveExperienceSystem;
    protected abstract canDistributeLessDefault(): boolean;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(event): void { }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (properties.player === RelativePlayer.Opponent && !context.player.opponent) {
            return;
        }
        const player = properties.player === RelativePlayer.Opponent ? context.player.opponent : context.player;
        const amountToDistribute = this.getAmountToDistribute(properties.amountToDistribute, context);

        if (amountToDistribute === 0) {
            return;
        }

        if (!properties.selector.hasEnoughTargets(context, player)) {
            return;
        }

        const legalTargets = properties.selector.getAllLegalTargets(context);

        // auto-select if there's only one legal target and the player isn't allowed to choose 0 targets
        if ((!properties.canChooseNoTargets && !context.ability.optional) && legalTargets.length === 1) {
            events.push(this.generateEffectEvent(legalTargets[0], context, amountToDistribute));
            return;
        }

        // build prompt with handler that will push damage / heal events into execution window on prompt resolution
        const promptProperties: IDistributeAmongTargetsPromptProperties = {
            type: this.promptType,
            legalTargets,
            canChooseNoTargets: properties.canChooseNoTargets || context.ability.optional,
            canDistributeLess: properties.canDistributeLess,
            maxTargets: properties.maxTargets,
            source: context.source,
            amount: amountToDistribute,
            resultsHandler: (results: IDistributeAmongTargetsPromptResults) =>
                results.valueDistribution.forEach((amount, card) => events.push(this.generateEffectEvent(card, context, amount)))
        };

        context.game.promptDistributeAmongTargets(player, promptProperties);
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);

        Contract.assertFalse(properties.canDistributeLess && !properties.canChooseNoTargets, 'Must set properties.canDistributeLess to true if properties.canChooseNoTargets is true');

        if (!properties.selector) {
            const effectSystem = this.generateEffectSystem();
            const cardCondition = (card, context) =>
                effectSystem.canAffect(card, context) && properties.cardCondition(card, context);
            properties.selector = CardSelectorFactory.create(Object.assign({}, properties, { cardCondition, mode: TargetMode.Unlimited }));
        }
        return properties;
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player =
            (properties.player === RelativePlayer.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.canTarget(card, context, player);
    }

    public override hasLegalTarget(context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const player =
            (properties.player === RelativePlayer.Opponent && context.player.opponent) ||
            context.player;
        return properties.selector.hasEnoughTargets(context, player);
    }

    private generateEffectEvent(card: Card, context: TContext, amount: number) {
        const effectSystem = this.generateEffectSystem(card, amount);
        return effectSystem.generateEvent(context);
    }

    private getAmountToDistribute(amountToDistributeOrFn: number | ((context: TContext) => number), context: TContext): number {
        return typeof amountToDistributeOrFn === 'function' ? amountToDistributeOrFn(context) : amountToDistributeOrFn;
    }
}
