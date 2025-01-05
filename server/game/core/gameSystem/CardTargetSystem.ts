import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { CardTypeFilter } from '../Constants';
import { EffectName, EventName, GameStateChangeRequired, WildcardCardType, ZoneName } from '../Constants';
import type { IGameSystemProperties as IGameSystemProperties } from './GameSystem';
import { GameSystem as GameSystem } from './GameSystem';
import { GameEvent } from '../event/GameEvent';
import * as EnumHelpers from '../utils/EnumHelpers';
import * as Helpers from '../utils/Helpers';
import * as Contract from '../utils/Contract';
import type { UnitCard } from '../card/CardTypes';
import type { GameObject } from '../GameObject';

export interface ICardTargetSystemProperties extends IGameSystemProperties {
    target?: Card | Card[];
}

/**
 * A {@link GameSystem} which targets a card or cards for its effect
 */
// TODO: could we remove the default generic parameter so that all child classes are forced to declare it
export abstract class CardTargetSystem<TContext extends AbilityContext = AbilityContext, TProperties extends ICardTargetSystemProperties = ICardTargetSystemProperties> extends GameSystem<TContext, TProperties> {
    /** The set of card types that can be legally targeted by the system. Defaults to {@link WildcardCardType.Any} unless overriden. */
    protected readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Any];

    protected override isTargetTypeValid(target: GameObject | GameObject[]): boolean {
        for (const targetItem of Helpers.asArray(target)) {
            if (!targetItem.isCard() || !EnumHelpers.cardTypeMatches(targetItem.type, this.targetTypeFilter)) {
                return false;
            }
        }

        return Helpers.asArray(target).length > 0;
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        let { target } = this.generatePropertiesFromContext(context, additionalProperties);
        target = this.processTargets(target);
        for (const card of Helpers.asArray(target)) {
            let allCostsPaid = true;
            const additionalCosts = card
                .getOngoingEffectValues(EffectName.UnlessActionCost)
                .filter((properties) => properties.actionName === this.name);

            if (context.player && context.ability && context.ability.targetResolvers && context.ability.targetResolvers.length > 0) {
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
                    }, 'resolve card targeting costs');
                }
                context.game.queueSimpleStep(() => {
                    if (allCostsPaid) {
                        events.push(this.generateRetargetedEvent(card, context, additionalProperties));
                    }
                }, 'push card target event if targeting cost paid');
            } else {
                if (allCostsPaid) {
                    events.push(this.generateRetargetedEvent(card, context, additionalProperties));
                }
            }
        }
    }

    // override the base class behavior with a version that forces properties.target to be a scalar value
    public override generateEvent(context: TContext, additionalProperties: any = {}): GameEvent {
        const { target } = this.generatePropertiesFromContext(context, additionalProperties);

        Contract.assertNotNullLike(target, 'Attempting to generate card target event with no provided target');

        let nonArrayTarget: any;
        if (Array.isArray(target)) {
            // need to use queueGenerateEventGameSteps for multiple-target scenarios
            Contract.assertTrue(target.length === 1, `CardTargetSystem must have 'target' property with exactly 1 target, instead found ${target.length}`);
            nonArrayTarget = target[0];
        } else {
            Contract.assertNotNullLike(target, 'CardTargetSystem must have non-null \'target\' propery');
            nonArrayTarget = target;
        }

        const event = this.createEvent(nonArrayTarget, context, additionalProperties);
        this.updateEvent(event, nonArrayTarget, context, additionalProperties);
        return event;
    }

    public override checkEventCondition(event: any, additionalProperties = {}): boolean {
        // TODO Migrate game state check to somewhere more universal
        return this.canAffect(event.card, event.context, additionalProperties, GameStateChangeRequired.MustFullyResolve);
    }

    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        // if a unit is pending defeat (damage >= hp but defeat not yet resolved), always return canAffect() = false unless
        // we're the system that is enacting the defeat
        if (card.isUnit() && card.isInPlay() && card.pendingDefeat) {
            return false;
        }

        return super.canAffect(card, context, additionalProperties, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties: any = {}): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.card = card;
    }

    protected override defaultTargets(context: TContext): Card[] {
        return [context.source];
    }

    protected addLeavesPlayPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        Contract.assertTrue(card.canBeInPlay() && card.isInPlay(), `Attempting to add leaves play contingent events to card ${card.internalName} but is in zone ${card.zone}`);

        event.setContingentEventsGenerator((event) => {
            const onCardLeavesPlayEvent = new GameEvent(EventName.OnCardLeavesPlay, context, {
                player: context.player,
                card
            });
            let contingentEvents = [onCardLeavesPlayEvent];

            if (card.isUnit()) {
                // add events to defeat any upgrades attached to this card and free any captured units. the events will
                // be added as "contingent events" in the event window, so they'll resolve in the same window but after the primary event
                contingentEvents = contingentEvents.concat(this.generateUpgradeDefeatEvents(card, context, event));
                contingentEvents = contingentEvents.concat(this.generateRescueEvents(card, context, event));
            }

            if (card.isUpgrade()) {
                contingentEvents.push(
                    new GameEvent(
                        EventName.OnUpgradeUnattached,
                        context,
                        {
                            upgradeCard: card,
                            parentCard: card.parentCard,
                        }
                    )
                );
            }

            return contingentEvents;
        });

        // TODO GAR SAXON: the L5R 'ancestral' keyword behaves exactly like Gar's deployed ability, we can reuse this code for him
        // event.preResolutionEffect = () => {
        //     event.cardStateWhenLeftPlay = event.card.createSnapshot();
        //     if (event.card.isAncestral() && event.isContingent) {
        //         event.destination = ZoneName.Hand;
        //         context.game.addMessage(
        //             '{0} returns to {1}'s hand due to its Ancestral keyword',
        //             event.card,
        //             event.card.owner
        //         );
        //     }
        // };
    }

    private generateUpgradeDefeatEvents(card: UnitCard, context: TContext, event: any): any[] {
        const defeatEvents = [];

        for (const upgrade of card.upgrades) {
            const defeatEvent = context.game.actions
                .defeat({ target: upgrade })
                .generateEvent(context.game.getFrameworkContext());

            defeatEvent.order = event.order - 1;

            defeatEvent.isContingent = true;
            defeatEvents.push(defeatEvent);
        }

        return defeatEvents;
    }

    private generateRescueEvents(card: UnitCard, context: TContext, event: any): any[] {
        const rescueEvents = [];

        for (const captured of card.capturedUnits) {
            const rescueEvent = context.game.actions
                .rescue({ target: captured })
                .generateEvent(context.game.getFrameworkContext());

            rescueEvent.order = event.order - 1;

            rescueEvent.isContingent = true;
            rescueEvents.push(rescueEvent);
        }

        return rescueEvents;
    }

    /**
     * Manages special rules for units leaving play, such as leaders or tokens.
     * Should be called as the handler for systems that move a unit out of the arena.
     *
     * @param card Card leaving play
     * @param destination Zone the card is being moved to
     * @param context context
     * @param defaultMoveAction A handler that will move the card to its destination if none of the special cases apply
     */
    protected leavesPlayEventHandler(card: UnitCard, destination: ZoneName, context: TContext, defaultMoveAction: () => void): void {
        // Attached upgrades should be unattached before move
        if (card.isUpgrade()) {
            Contract.assertTrue(card.isAttached(), `Attempting to unattach upgrade card ${card} due to leaving play but it is already unattached.`);
            card.unattach();
        }

        if (card.isLeader() && !EnumHelpers.isArena(destination)) {
            // TODO: punting on this since no card could do it currently and it requires some work
            throw new Error('Leaders leaving the arena due to a non-defeat effect is not yet implemented');
        } else if (card.isToken() && !EnumHelpers.isArena(destination)) {
            // tokens are removed from the game when they leave the arena
            card.moveTo(ZoneName.OutsideTheGame);
        } else {
            defaultMoveAction();
        }
    }

    /**
     * You can override this method in case you need to make operations on targets before queuing events
     * (for example you can look MoveCardSystem.ts for shuffleMovedCards part)
     */
    protected processTargets(target: Card | Card[]) {
        return target;
    }
}
