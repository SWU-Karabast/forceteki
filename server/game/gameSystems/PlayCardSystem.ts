import type { Card } from '../core/card/Card';
import AbilityResolver from '../core/gameSteps/AbilityResolver';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import * as Contract from '../core/utils/Contract';
import { CardType, PlayType, MetaEventName } from '../core/Constants';
import type { PlayCardAction } from '../core/ability/PlayCardAction';
import { TriggerHandlingMode } from '../core/event/EventWindow';
import type { ICostAdjusterProperties } from '../core/cost/CostAdjuster';
import { CostAdjuster } from '../core/cost/CostAdjuster';

export interface IPlayCardProperties extends ICardTargetSystemProperties {
    ignoredRequirements?: string[];

    /** By default, the system will inherit the `optional` property from the activating ability. Use this to override the behavior. */
    optional?: boolean;
    entersReady?: boolean;
    playType?: PlayType;
    adjustCost?: ICostAdjusterProperties;
    nested?: boolean;
    canTargetOpponentZones?: boolean;
    // TODO: implement a "nested" property that controls whether triggered abilities triggered by playing the card resolve after that card play or after the whole ability
}

// TODO: implement playing with smuggle and from non-standard zones(discard(e.g. Palpatine's Return), top of deck(e.g. Ezra Bridger), etc.) as part of abilities with another function(s)
/**
 * This system is a helper for playing cards from abilities (see {@link GameSystemLibrary.playCard}).
 */
export class PlayCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IPlayCardProperties> {
    public override readonly name = 'playCard';
    public override readonly eventName = MetaEventName.PlayCard;
    protected override readonly targetTypeFilter = [CardType.BasicUnit, CardType.BasicUpgrade, CardType.Event];
    protected override readonly defaultProperties: IPlayCardProperties = {
        ignoredRequirements: [],
        optional: false,
        entersReady: false,
        playType: PlayType.PlayFromHand,
        nested: false,
        canTargetOpponentZones: false,
    };

    public eventHandler(event, additionalProperties): void {
        const availablePlayCardAbilities = event.playCardAbilities as PlayCardAction[];

        if (availablePlayCardAbilities.length === 1) {
            this.resolvePlayCardAbility(availablePlayCardAbilities[0], event);
        } else if (availablePlayCardAbilities.length > 1) {
            event.context.game.promptWithHandlerMenu(event.context.player, {
                activePromptTitle: `Choose an option for playing ${event.card.title}`,
                source: event.card,
                choices: availablePlayCardAbilities.map((action) => action.title),
                handlers: availablePlayCardAbilities.map((action) => (() => this.resolvePlayCardAbility(action, event)))
            });
        } else {
            Contract.fail(`No legal play card abilities found for card ${event.card.internalName}`);
        }
    }

    private resolvePlayCardAbility(ability: PlayCardAction, event: any) {
        const newContext = ability.createContext(event.player);

        // The event player is taking over control of the card here as they are playing it
        if (event.player !== event.card.controller) {
            event.card.setNewController(event.player);
        }
        event.context.game.queueStep(new AbilityResolver(event.context.game, newContext, event.optional));
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['play {0}', [properties.target]];
    }

    protected override addPropertiesToEvent(event, target, context: TContext, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        super.addPropertiesToEvent(event, target, context, additionalProperties);

        event.playCardAbilities = this.generateLegalPlayCardAbilities(target, properties, context);
        event.optional = properties.optional ?? context.ability.optional;
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        if (!card.isTokenOrPlayable() || card.isToken()) {
            return false;
        }
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (!super.canAffect(card, context)) {
            return false;
        }

        return this.generateLegalPlayCardAbilities(card, properties, context).length > 0;
    }

    private makeCostAdjuster(properties: ICostAdjusterProperties | null, context: TContext) {
        return properties ? new CostAdjuster(context.game, context.source, properties) : null;
    }

    /**
     * Generate a play card ability for the specified card.
     */
    private generateLegalPlayCardAbilities(card: Card, properties: IPlayCardProperties, context: TContext) {
        Contract.assertTrue(card.isTokenOrPlayable() && !card.isToken());

        const overrideProperties = this.buildPlayActionProperties(card, properties, context);

        const availableCardPlayActions = properties.playType === PlayType.PlayFromOutOfPlay
            ? card.getPlayCardFromOutOfPlayActions(overrideProperties)
            : card.getPlayCardActions(overrideProperties);

        // filter out actions that don't match the expected playType or aren't legal in the current play context (e.g. can't be paid for)
        return availableCardPlayActions.filter((action) => {
            const newContext = action.createContext(context.player);
            return action.playType === properties.playType && action.meetsRequirements(newContext, properties.ignoredRequirements) === '';
        });
    }

    private buildPlayActionProperties(card: Card, properties: IPlayCardProperties, context: TContext, action: PlayCardAction = null) {
        let costAdjusters = [this.makeCostAdjuster(properties.adjustCost, context)];
        if (action) {
            costAdjusters = costAdjusters.concat(action.costAdjusters);
        }

        return {
            card,
            playType: properties.playType,
            triggerHandlingMode: properties.nested ? TriggerHandlingMode.ResolvesTriggers : TriggerHandlingMode.PassesTriggersToParentWindow,
            costAdjusters,
            entersReady: properties.entersReady,
            canTargetOpponentZones: properties.canTargetOpponentZones
        };
    }
}
