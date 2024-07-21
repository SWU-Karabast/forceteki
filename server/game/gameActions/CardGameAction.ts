import type { AbilityContext } from '../AbilityContext';
import type BaseCard from '../basecard';
import { CardTypes, EffectNames, Locations } from '../Constants';
import type DrawCard from '../drawcard';
import type Ring from '../ring';
import { GameAction, GameActionProperties } from './GameAction';
import { LoseFateAction } from './LoseFateAction';

export interface CardActionProperties extends GameActionProperties {
    target?: BaseCard | BaseCard[];
}

export class CardGameAction<P extends CardActionProperties = CardActionProperties> extends GameAction<P> {
    targetType = [
        CardTypes.Character,
        CardTypes.Attachment,
        CardTypes.Holding,
        CardTypes.Event,
        CardTypes.Stronghold,
        CardTypes.Province,
        CardTypes.Role,
        'ring'
    ];

    defaultTargets(context: AbilityContext): BaseCard[] {
        return [context.source];
    }

    checkEventCondition(event: any, additionalProperties = {}): boolean {
        return this.canAffect(event.card, event.context, additionalProperties);
    }

    canAffect(target: BaseCard | Ring, context: AbilityContext, additionalProperties = {}): boolean {
        return super.canAffect(target, context, additionalProperties);
    }

    addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        const { target } = this.getProperties(context, additionalProperties);
        for (const card of target as BaseCard[]) {
            let allCostsPaid = true;
            const additionalCosts = card
                .getEffects(EffectNames.UnlessActionCost)
                .filter((properties) => properties.actionName === this.name);

            if (context.player && context.ability && context.ability.targets && context.ability.targets.length > 0) {
                let targetForCost = [card];

                if (context.targets.challenger && context.targets.duelTarget) {
                    //duels act weird, we need to handle targeting differently for them to work
                    let duelTargets = Object.values<BaseCard | Array<BaseCard>>(context.targets).flat();
                    targetForCost = targetForCost.concat(duelTargets);
                }

                targetForCost.forEach((costTarget) => {
                    const targetingCosts = context.player.getTargetingCost(context.source, costTarget);
                    //we should only resolve the targeting costs once per card per target, even if it has multiple abilities - so track who we've already paid to target
                    if (
                        (!context.costs ||
                            !context.costs.targetingCostPaid ||
                            !context.costs.targetingCostPaid.includes(costTarget)) &&
                        targetingCosts > 0
                    ) {
                        if (!context.costs.targetingCostPaid) {
                            context.costs.targetingCostPaid = [];
                        }
                        context.costs.targetingCostPaid.push(costTarget);
                        let properties = { amount: targetingCosts, target: context.player };
                        let cost = new LoseFateAction(properties);
                        if (cost.canAffect(context.player, context)) {
                            context.game.addMessage(
                                '{0} pays {1} fate in order to target {2}',
                                context.player,
                                targetingCosts,
                                costTarget.name
                            );
                            cost.resolve(context.player, context);
                        } else {
                            context.game.addMessage(
                                '{0} cannot pay {1} fate in order to target {2}',
                                context.player,
                                targetingCosts,
                                costTarget.name
                            );
                            allCostsPaid = false;
                        }
                    }
                });
            }

            if (additionalCosts.length > 0) {
                for (const properties of additionalCosts) {
                    context.game.queueSimpleStep(() => {
                        let cost = properties.cost;
                        if (typeof cost === 'function') {
                            cost = cost(card);
                        }
                        if (cost.hasLegalTarget(context)) {
                            cost.resolve(card, context);
                            context.game.addMessage(
                                '{0} {1} in order to {2}',
                                card.controller,
                                cost.getEffectMessage(context),
                                this.getEffectMessage(context, additionalProperties)
                            );
                        } else {
                            allCostsPaid = false;
                            context.game.addMessage(
                                '{0} cannot pay the additional cost required to {1}',
                                card.controller,
                                this.getEffectMessage(context, additionalProperties)
                            );
                        }
                    });
                }
                context.game.queueSimpleStep(() => {
                    if (allCostsPaid) {
                        events.push(this.getEvent(card, context, additionalProperties));
                    }
                });
            } else {
                if (allCostsPaid) {
                    events.push(this.getEvent(card, context, additionalProperties));
                }
            }
        }
    }

    addPropertiesToEvent(event, card: BaseCard, context: AbilityContext, additionalProperties = {}): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.card = card;
    }

    isEventFullyResolved(event, card: BaseCard, context: AbilityContext, additionalProperties): boolean {
        return event.card === card && super.isEventFullyResolved(event, card, context, additionalProperties);
    }

    updateLeavesPlayEvent(event, card: BaseCard, context: AbilityContext, additionalProperties): void {
        let properties = this.getProperties(context, additionalProperties) as any;
        super.updateEvent(event, card, context, additionalProperties);
        event.isSacrifice = this.name === 'sacrifice';
        event.destination =
            properties.destination || (card.isDynasty ? Locations.DynastyDiscardPile : Locations.ConflictDiscardPile);
        event.preResolutionEffect = () => {
            event.cardStateWhenLeftPlay = event.card.createSnapshot();
            if (event.card.isAncestral() && event.isContingent) {
                event.destination = Locations.Hand;
                context.game.addMessage(
                    "{0} returns to {1}'s hand due to its Ancestral keyword",
                    event.card,
                    event.card.owner
                );
            }
        };
        event.createContingentEvents = () => {
            let contingentEvents = [];
            // Add an imminent triggering condition for all attachments leaving play

            for (const attachment of (event.card.attachments ?? []) as DrawCard[]) {
                // we only need to add events for attachments that are in play.
                if (attachment.location === Locations.PlayArea) {
                    let attachmentEvent = context.game.actions
                        .discardFromPlay()
                        .getEvent(attachment, context.game.getFrameworkContext());
                    attachmentEvent.order = event.order - 1;
                    let previousCondition = attachmentEvent.condition;
                    attachmentEvent.condition = (attachmentEvent) =>
                        previousCondition(attachmentEvent) && attachment.parent === event.card;
                    attachmentEvent.isContingent = true;
                    contingentEvents.push(attachmentEvent);
                }
            }

            // Add an imminent triggering condition for removing fate
            if (event.card.allowGameAction('removeFate', context.game.getFrameworkContext())) {
                let fateEvent = context.game.actions
                    .removeFate({ amount: event.card.getFate() })
                    .getEvent(event.card, context.game.getFrameworkContext());
                fateEvent.order = event.order - 1;
                fateEvent.isContingent = true;
                contingentEvents.push(fateEvent);
            }
            return contingentEvents;
        };
    }

    leavesPlayEventHandler(event, additionalProperties = {}): void {
        this.checkForRefillProvince(event.card, event, additionalProperties);
        if (!event.card.owner.isLegalLocationForCard(event.card, event.destination)) {
            event.card.game.addMessage(
                '{0} is not a legal location for {1} and it is discarded',
                event.destination,
                event.card
            );
            event.destination = event.card.isDynasty ? Locations.DynastyDiscardPile : Locations.ConflictDiscardPile;
        }
        event.card.owner.moveCard(event.card, event.destination, event.options || {});
    }

    checkForRefillProvince(card: BaseCard, event, additionalProperties: any = {}): void {
        if (!card.isInProvince() || card.location === Locations.StrongholdProvince) {
            return;
        }
        const context = !!additionalProperties.replacementEffect ? event.context.event.context : event.context;
        context.refillProvince(card.controller, card.location);
    }
}
