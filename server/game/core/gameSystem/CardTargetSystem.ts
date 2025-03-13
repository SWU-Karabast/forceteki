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
import type { GameObject } from '../GameObject';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { IPlayableOrDeployableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import type { ILastKnownInformation } from '../../gameSystems/DefeatCardSystem';
import type { IUpgradeCard } from '../card/CardInterfaces';

export interface ICardTargetSystemProperties extends IGameSystemProperties {
    target?: Card | Card[];
}

/**
 * Signature for a method that can override the default behavior for an upgrade attached to a unit leaving the arena (being defeated).
 * Returns `null` if it has no override for the passed upgrade card.
 */
export type AttachedUpgradeOverrideHandler = (card: IUpgradeCard, context: AbilityContext) => CardTargetSystem<AbilityContext> | null;

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
        target = this.processTargets(target, context);
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

    protected addLeavesPlayPropertiesToEvent(
        event,
        card: Card,
        context: TContext,
        additionalProperties,
        attachedUpgradeOverrideHandler?: AttachedUpgradeOverrideHandler,
    ): void {
        Contract.assertTrue(card.canBeInPlay() && card.isInPlay(), `Attempting to add leaves play contingent events to card ${card.internalName} but is in zone ${card.zone}`);

        event.setContingentEventsGenerator((event) => {
            const onCardLeavesPlayEvent = new GameEvent(EventName.OnCardLeavesPlay, context, {
                player: context.player,
                card
            });

            this.addLastKnownInformationToEvent(onCardLeavesPlayEvent, card);

            let contingentEvents = [onCardLeavesPlayEvent];

            if (card.isUnit()) {
                // add events to defeat any upgrades attached to this card and free any captured units. the events will
                // be added as "contingent events" in the event window, so they'll resolve in the same window but after the primary event
                contingentEvents = contingentEvents.concat(this.buildUnitCleanupContingentEvents(card, context, event, attachedUpgradeOverrideHandler));
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
    }

    protected buildUnitCleanupContingentEvents(card: IUnitCard, context: TContext, event: any, attachedUpgradeOverrideHandler?: AttachedUpgradeOverrideHandler): any[] {
        let contingentEvents = [];
        contingentEvents = contingentEvents.concat(this.generateRemoveUpgradeEvents(card, context, event, attachedUpgradeOverrideHandler));
        contingentEvents = contingentEvents.concat(this.generateRescueEvents(card, context, event));
        return contingentEvents;
    }

    private generateRemoveUpgradeEvents(card: IUnitCard, context: TContext, event: any, attachedUpgradeOverrideHandler?: AttachedUpgradeOverrideHandler): any[] {
        const removeUpgradeEvents = [];

        for (const upgrade of card.upgrades) {
            let removeUpgradeEvent: GameEvent = null;

            if (attachedUpgradeOverrideHandler) {
                removeUpgradeEvent = attachedUpgradeOverrideHandler(upgrade, context)?.generateEvent(context);
            }

            // if no override, the default behavior is to defeat the attachment
            if (!removeUpgradeEvent) {
                removeUpgradeEvent = context.game.actions
                    .defeat({ target: upgrade })
                    .generateEvent(context.game.getFrameworkContext());
            }

            removeUpgradeEvent.order = event.order - 1;

            removeUpgradeEvent.isContingent = true;
            removeUpgradeEvents.push(removeUpgradeEvent);
        }

        return removeUpgradeEvents;
    }

    private generateRescueEvents(card: IUnitCard, context: TContext, event: any): any[] {
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
    protected leavesPlayEventHandler(card: IPlayableOrDeployableCard, destination: ZoneName, context: TContext, defaultMoveAction: () => void): void {
        // Attached upgrades should be unattached before move
        if (card.isUpgrade()) {
            Contract.assertTrue(card.isAttached(), `Attempting to unattach upgrade card ${card} due to leaving play but it is already unattached.`);
            card.unattach();
        }

        if (card.isDeployableLeader() && !EnumHelpers.isArena(destination)) {
            card.undeploy();
        } else if (card.isToken() && !EnumHelpers.isArena(destination)) {
            // tokens are removed from the game when they leave the arena
            card.moveTo(ZoneName.OutsideTheGame);
        } else {
            defaultMoveAction();
        }
    }

    /**
     * Manages side effects for when resources leave the resource zone.
     * Specifically, if the resource is leaving due to a friendly effect, we will ensure that it
     * is exhausted before leaving the zone by swapping its ready state with an exhausted resource (if available).
     *
     * @param card Resource card leaving play
     * @param context context
     */
    protected leavesResourceZoneEventHandler(card: IPlayableOrDeployableCard, context: TContext): void {
        Contract.assertTrue(card.zoneName === ZoneName.Resource);
        if (card.controller !== context.player) {
            return;
        }

        Contract.assertTrue(card.canBeExhausted());
        if (!card.exhausted) {
            card.controller.swapResourceReadyState(card);
        }
    }

    protected addLastKnownInformationToEvent(event: any, card: Card): void {
        // build last known information for the card before event window resolves to ensure that no state has yet changed
        event.setPreResolutionEffect((event) => {
            event.lastKnownInformation = this.buildLastKnownInformation(card);
        });
    }

    private buildLastKnownInformation(card: Card): ILastKnownInformation {
        Contract.assertTrue(
            card.zoneName === ZoneName.GroundArena ||
            card.zoneName === ZoneName.SpaceArena ||
            card.zoneName === ZoneName.Resource
        );

        if (card.zoneName === ZoneName.Resource) {
            return {
                card,
                controller: card.controller,
                arena: card.zoneName
            };
        }
        Contract.assertTrue(card.canBeInPlay());


        if (card.isUnit() && !card.isAttached()) {
            return {
                card,
                power: card.getPower(),
                hp: card.getHp(),
                type: card.type,
                arena: card.zoneName,
                controller: card.controller,
                damage: card.damage,
                upgrades: card.upgrades
            };
        }

        if (card.isUpgrade()) {
            return {
                card,
                power: card.getPower(),
                hp: card.getHp(),
                type: card.type,
                arena: card.zoneName,
                controller: card.controller,
                parentCard: card.parentCard
            };
        }

        Contract.fail(`Unexpected card type: ${card.type}`);
    }

    /**
     * You can override this method in case you need to make operations on targets before queuing events
     * (for example you can look MoveCardSystem.ts for shuffleMovedCards part)
     */
    protected processTargets(target: Card | Card[], context: TContext): Card | Card[] {
        return target;
    }
}
