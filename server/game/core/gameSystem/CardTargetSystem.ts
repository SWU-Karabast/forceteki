import type { AbilityContext } from '../ability/AbilityContext';
import type Card from '../card/Card';
import { CardType, EffectName, Location } from '../Constants';
import { GameSystem as GameSystem, IGameSystemProperties as IGameSystemProperties } from './GameSystem';
// import { LoseFateAction } from './LoseFateAction';

export interface ICardTargetSystemProperties extends IGameSystemProperties {
    target?: Card | Card[];
}

/**
 * A {@link GameSystem} which targets a card or cards for its effect
 */
export abstract class CardTargetSystem<P extends ICardTargetSystemProperties = ICardTargetSystemProperties> extends GameSystem<P> {
    override targetType = [
        CardType.Unit,
        CardType.Upgrade,
        CardType.Event,
        CardType.Leader,
        CardType.Base,
    ];

    override defaultTargets(context: AbilityContext): Card[] {
        return [context.source];
    }

    override checkEventCondition(event: any, additionalProperties = {}): boolean {
        return this.canAffect(event.card, event.context, additionalProperties);
    }

    override canAffect(target: Card, context: AbilityContext, additionalProperties = {}): boolean {
        return super.canAffect(target, context, additionalProperties);
    }

    override addEventsToArray(events: any[], context: AbilityContext, additionalProperties = {}): void {
        const { target } = this.generatePropertiesFromContext(context, additionalProperties);
        for (const card of target as Card[]) {
            let allCostsPaid = true;
            const additionalCosts = card
                .getEffects(EffectName.UnlessActionCost)
                .filter((properties) => properties.actionName === this.name);

            if (context.player && context.ability && context.ability.targets && context.ability.targets.length > 0) {
                // let targetForCost = [card];

                // if (context.targets.challenger && context.targets.duelTarget) {
                //     //duels act weird, we need to handle targeting differently for them to work
                //     let duelTargets = Object.values<BaseCard | Array<BaseCard>>(context.targets).flat();
                //     targetForCost = targetForCost.concat(duelTargets);
                // }

                // targetForCost.forEach((costTarget) => {
                //     const targetingCosts = context.player.getTargetingCost(context.source, costTarget);
                //     //we should only resolve the targeting costs once per card per target, even if it has multiple abilities - so track who we've already paid to target
                //     if (
                //         (!context.costs ||
                //             !context.costs.targetingCostPaid ||
                //             !context.costs.targetingCostPaid.includes(costTarget)) &&
                //         targetingCosts > 0
                //     ) {
                //         if (!context.costs.targetingCostPaid) {
                //             context.costs.targetingCostPaid = [];
                //         }
                //         context.costs.targetingCostPaid.push(costTarget);
                //         let properties = { amount: targetingCosts, target: context.player };
                //         let cost = new LoseFateAction(properties);
                //         if (cost.canAffect(context.player, context)) {
                //             context.game.addMessage(
                //                 '{0} pays {1} fate in order to target {2}',
                //                 context.player,
                //                 targetingCosts,
                //                 costTarget.name
                //             );
                //             cost.resolve(context.player, context);
                //         } else {
                //             context.game.addMessage(
                //                 '{0} cannot pay {1} fate in order to target {2}',
                //                 context.player,
                //                 targetingCosts,
                //                 costTarget.name
                //             );
                //             allCostsPaid = false;
                //         }
                //     }
                // });
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

    override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties = {}): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.card = card;
    }

    override isEventFullyResolved(event, card: Card, context: AbilityContext, additionalProperties): boolean {
        return event.card === card && super.isEventFullyResolved(event, card, context, additionalProperties);
    }

    updateLeavesPlayEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        let properties = this.generatePropertiesFromContext(context, additionalProperties) as any;
        super.updateEvent(event, card, context, additionalProperties);
        event.destination = Location.Discard;
        // event.preResolutionEffect = () => {
        //     event.cardStateWhenLeftPlay = event.card.createSnapshot();
        //     if (event.card.isAncestral() && event.isContingent) {
        //         event.destination = Location.Hand;
        //         context.game.addMessage(
        //             "{0} returns to {1}'s hand due to its Ancestral keyword",
        //             event.card,
        //             event.card.owner
        //         );
        //     }
        // };
        event.createContingentEvents = () => {
            let contingentEvents = [];
            // Add an imminent triggering condition for all attachments leaving play

            // for (const attachment of (event.card.attachments ?? []) as BaseCard[]) {
            //     // we only need to add events for attachments that are in play.
            //     if (attachment.location === Location.PlayArea) {
            //         let attachmentEvent = context.game.actions
            //             .discardFromPlay()
            //             .getEvent(attachment, context.game.getFrameworkContext());
            //         attachmentEvent.order = event.order - 1;
            //         let previousCondition = attachmentEvent.condition;
            //         attachmentEvent.condition = (attachmentEvent) =>
            //             previousCondition(attachmentEvent) && attachment.parent === event.card;
            //         attachmentEvent.isContingent = true;
            //         contingentEvents.push(attachmentEvent);
            //     }
            // }

            return contingentEvents;
        };
    }

    leavesPlayEventHandler(event, additionalProperties = {}): void {
        if (!event.card.owner.isLegalLocationForCard(event.card, event.destination)) {
            event.card.game.addMessage(
                '{0} is not a legal location for {1} and it is discarded',
                event.destination,
                event.card
            );
            event.destination = Location.Deck;
        }
        event.card.owner.moveCard(event.card, event.destination, event.options || {});
    }
}
