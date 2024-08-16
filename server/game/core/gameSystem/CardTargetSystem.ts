import type { AbilityContext } from '../ability/AbilityContext';
import type Card from '../card/Card';
import { CardType, EffectName, Location } from '../Constants';
import { GameSystem as GameSystem, IGameSystemProperties as IGameSystemProperties } from './GameSystem';
import { GameEvent } from '../event/GameEvent';
// import { LoseFateAction } from './LoseFateAction';

export interface ICardTargetSystemProperties extends IGameSystemProperties {
    target?: Card | Card[];
}

/**
 * A {@link GameSystem} which targets a card or cards for its effect
 */
// TODO: mixin for Action types (CardAction, PlayerAction)?
// TODO: could we remove the default generic parameter so that all child classes are forced to declare it
export abstract class CardTargetSystem<TProperties extends ICardTargetSystemProperties = ICardTargetSystemProperties> extends GameSystem<TProperties> {
    override targetType = [
        CardType.Unit,
        CardType.Upgrade,
        CardType.EventTmp,
        CardType.Leader,
        CardType.Base,
    ];

    override defaultTargets(context: AbilityContext): Card[] {
        return [context.source];
    }

    override checkEventCondition(event: any, additionalProperties = {}): boolean {
        return this.canAffect(event.card, event.context, additionalProperties);
    }

    override generateEventsForAllTargets(context: AbilityContext, additionalProperties = {}): GameEvent[] {
        const events: GameEvent[] = [];

        const { target } = this.generatePropertiesFromContext(context, additionalProperties);
        for (const card of target as Card[]) {
            let allCostsPaid = true;
            const additionalCosts = card
                .getEffectValues(EffectName.UnlessActionCost)
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
                        events.push(this.generateEvent(card, context, additionalProperties));
                    }
                });
            } else {
                if (allCostsPaid) {
                    events.push(this.generateEvent(card, context, additionalProperties));
                }
            }
        }

        return events;
    }

    override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties = {}): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.card = card;
    }

    override isEventFullyResolved(event, card: Card, context: AbilityContext, additionalProperties): boolean {
        return event.card === card && super.isEventFullyResolved(event, card, context, additionalProperties);
    }

    protected updateLeavesPlayEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as any;
        super.updateEvent(event, card, context, additionalProperties);
        event.destination = Location.Discard;
        // TODO GAR SAXON: the L5R 'ancestral' keyword behaves exactly like Gar's deployed ability, we can reuse this code for him
        // event.preResolutionEffect = () => {
        //     event.cardStateWhenLeftPlay = event.card.createSnapshot();
        //     if (event.card.isAncestral() && event.isContingent) {
        //         event.destination = Location.Hand;
        //         context.game.addMessage(
        //             '{0} returns to {1}'s hand due to its Ancestral keyword',
        //             event.card,
        //             event.card.owner
        //         );
        //     }
        // };
        event.createContingentEvents = () => {
            const contingentEvents = [];

            // TODO UPGRADES: uncomment below code
            // Add an imminent triggering condition for all attachments leaving play

            // for (const attachment of (event.card.attachments ?? []) as BaseCard[]) {
            //     // we only need to add events for attachments that are in play.
            //     if (attachment.location === Location.PlayArea) {
            //         let attachmentEvent = context.game.actions
            //             .discardFromPlay()
            //             .generateEvent(attachment, context.game.getFrameworkContext());
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

    protected leavesPlayEventHandler(event, additionalProperties = {}): void {
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
