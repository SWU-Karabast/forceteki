import type { Card } from '../core/card/Card';
import AbilityResolver from '../core/gameSteps/AbilityResolver';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { AbilityContext } from '../core/ability/AbilityContext';
import * as Contract from '../core/utils/Contract';
import { CardType, PlayType, MetaEventName } from '../core/Constants';
import { PlayCardAction } from '../core/ability/PlayCardAction';
import { PlayUnitAction } from '../actions/PlayUnitAction';
import { PlayUpgradeAction } from '../actions/PlayUpgradeAction';
import { PlayEventAction } from '../actions/PlayEventAction';
import { TriggerHandlingMode } from '../core/event/EventWindow';
import { CostAdjuster, ICostAdjusterProperties } from '../core/cost/CostAdjuster';

export interface IPlayCardProperties extends ICardTargetSystemProperties {
    ignoredRequirements?: string[];

    /** By default, the system will inherit the `optional` property from the activating ability. Use this to override the behavior. */
    optional?: boolean;
    entersReady?: boolean;
    playType?: PlayType;
    adjustCost?: ICostAdjusterProperties;
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
        playType: PlayType.PlayFromHand
    };

    public eventHandler(event, additionalProperties): void {
        Contract.assertArraySize(event.playCardAbilities, 1);

        const player = event.player;
        const newContext = (event.playCardAbilities as PlayCardAction[])[0].createContext(player);

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

        const actionProperties = {
            card,
            playType: properties.playType,
            triggerHandlingMode: TriggerHandlingMode.ResolvesTriggers,
            costAdjuster: this.makeCostAdjuster(properties.adjustCost, context),
            entersReady: properties.entersReady
        };

        // find the card's available play actions (e.g. play from hand, smuggle), select those that match the type we're looking for,
        // then clone them with our property overrides
        const cardPlayActions = card.getPlayCardActions()
            .filter((action) => action.playType === properties.playType)
            .map((playAction) => playAction.clone(actionProperties));

        // if we're playing from out of play we may need to generate an action for the card since it won't have one by default
        if (cardPlayActions.length === 0 && properties.playType === PlayType.PlayFromOutOfPlay) {
            switch (actionProperties.card.type) {
                case CardType.BasicUnit:
                    cardPlayActions.push(new PlayUnitAction(actionProperties));
                    break;
                case CardType.BasicUpgrade:
                    cardPlayActions.push(new PlayUpgradeAction(actionProperties));
                    break;
                case CardType.Event:
                    cardPlayActions.push(new PlayEventAction(actionProperties));
                    break;
                default:
                    Contract.fail(`Attempted to play a card from out of play with invalid type ${actionProperties.card.type} as part of an ability`);
            }
        }

        // filter out actions that aren't legal
        return cardPlayActions.filter((action) => {
            const newContext = action.createContext(context.player);
            return action.meetsRequirements(newContext, properties.ignoredRequirements) === '';
        });
    }
}
