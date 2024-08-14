const _ = require('underscore');

const { BaseStepWithPipeline } = require('./BaseStepWithPipeline.js');
const { SimpleStep } = require('./SimpleStep.js');
const InitiateCardAbilityEvent = require('../event/InitiateCardAbilityEvent.js');
const InitiateAbilityEventWindow = require('./abilityWindow/InitiateAbilityEventWindow.js');
const { Location, Stage, CardType, EventName } = require('../Constants.js');

// TODO: convert to TS
class AbilityResolver extends BaseStepWithPipeline {
    constructor(game, context) {
        super(game);

        this.context = context;
        this.canCancel = true;
        this.initiateAbility = false;
        this.passPriority = false;
        this.events = [];
        this.provincesToRefill = [];
        this.targetResults = {};
        this.costResults = this.getCostResults();
        this.initialise();

        // TODO: add interface for this in Interfaces.ts when we convert to TS
        // this is used when a triggerd ability is marked optional to ensure that a "Pass" button
        // appears at all times during the prompt flow for that ability
        this.passAbilityHandler = this.context.ability.optional ? {
            buttonText: 'Pass ability',
            arg: 'passAbility',
            hasBeenShown: false,
            handler: () => {
                this.cancelled = true;
                this.passPriority = true;
            }
        } : null;
    }

    initialise() {
        this.pipeline.initialise([
            // new SimpleStep(this.game, () => this.createSnapshot()),
            new SimpleStep(this.game, () => this.resolveEarlyTargets()),
            new SimpleStep(this.game, () => this.checkForCancelOrPass()),
            new SimpleStep(this.game, () => this.openInitiateAbilityEventWindow()),
        ]);
    }

    // TODO: figure out our story for snapshots
    // createSnapshot() {
    //     if([CardType.Unit, CardType.Base, CardType.Leader, CardType.Upgrade].includes(this.context.source.getType())) {
    //         this.context.cardStateWhenInitiated = this.context.source.createSnapshot();
    //     }
    // }

    openInitiateAbilityEventWindow() {
        if (this.cancelled) {
            return;
        }
        let eventName = EventName.OnAbilityResolverInitiated;
        let eventProps = {
            context: this.context
        };
        if (this.context.ability.isCardAbility()) {
            eventName = EventName.OnCardAbilityInitiated;
            eventProps = {
                card: this.context.source,
                ability: this.context.ability,
                context: this.context
            };
            if (this.context.ability.isCardPlayed()) {
                this.events.push(this.game.getEvent(EventName.OnCardPlayed, {
                    player: this.context.player,
                    card: this.context.source,
                    context: this.context,
                    originalLocation: this.context.source.location,
                    originallyOnTopOfConflictDeck: this.context.player && this.context.player.conflictDeck && this.context.player.conflictDeck.first() === this.context.source,
                    onPlayCardSource: this.context.onPlayCardSource,
                    playType: this.context.playType,
                    resolver: this
                }));
            }
            if (this.context.ability.isTriggeredAbility()) {
                this.events.push(this.game.getEvent(EventName.OnCardAbilityTriggered, {
                    player: this.context.player,
                    card: this.context.source,
                    context: this.context
                }));
            }
        }
        this.events.push(this.game.getEvent(eventName, eventProps, () => this.queueInitiateAbilitySteps()));
        this.game.queueStep(new InitiateAbilityEventWindow(this.game, this.events));
    }

    queueInitiateAbilitySteps() {
        this.queueStep(new SimpleStep(this.game, () => this.resolveCosts()));
        this.queueStep(new SimpleStep(this.game, () => this.payCosts()));
        this.queueStep(new SimpleStep(this.game, () => this.checkCostsWerePaid()));
        this.queueStep(new SimpleStep(this.game, () => this.resolveTargets()));
        this.queueStep(new SimpleStep(this.game, () => this.checkForCancelOrPass()));
        this.queueStep(new SimpleStep(this.game, () => this.initiateAbilityEffects()));
        this.queueStep(new SimpleStep(this.game, () => this.executeHandler()));
        this.queueStep(new SimpleStep(this.game, () => this.moveEventCardToDiscard()));
    }

    resolveEarlyTargets() {
        this.context.stage = Stage.PreTarget;
        if (!this.context.ability.cannotTargetFirst) {
            this.targetResults = this.context.ability.resolveTargets(this.context, this.passAbilityHandler);
        }
    }

    checkForCancelOrPass() {
        if (this.cancelled) {
            return;
        }

        if (this.passAbilityHandler && !this.passAbilityHandler.hasBeenShown) {
            this.queueStep(new SimpleStep(this.game, () => this.checkForPass()));
            return;
        }

        this.cancelled = this.targetResults.cancelled;
    }

    // TODO: add passHandler support here
    resolveCosts() {
        if (this.cancelled) {
            return;
        }
        this.costResults.canCancel = this.canCancel;
        this.context.stage = Stage.Cost;
        this.context.ability.resolveCosts(this.context, this.costResults);
    }

    getCostResults() {
        return {
            cancelled: false,
            canCancel: this.canCancel,
            events: [],
            playCosts: true,
            triggerCosts: true
        };
    }

    checkForPass() {
        if (this.cancelled) {
            return;
        } else if (this.costResults.cancelled) {
            this.cancelled = true;
            return;
        }

        if (this.passAbilityHandler && !this.passAbilityHandler.hasBeenShown) {
            this.passAbilityHandler.hasBeenShown = true;
            this.game.promptWithHandlerMenu(this.context.player, {
                activePromptTitle: 'Do you want to trigger this ability or pass?',
                choices: ['Trigger', 'Pass'],
                handlers: [
                    () => {},
                    () => {
                        this.passAbilityHandler.handler();
                    }
                ]
            });
        }
    }

    payCosts() {
        if (this.cancelled) {
            return;
        } else if (this.costResults.cancelled) {
            this.cancelled = true;
            return;
        }

        this.passPriority = true;
        if (this.costResults.events.length > 0) {
            this.game.openEventWindow(this.costResults.events);
        }
    }

    checkCostsWerePaid() {
        if (this.cancelled) {
            return;
        }
        this.cancelled = _.any(this.costResults.events, (event) => event.getResolutionEvent().cancelled);
        if (this.cancelled) {
            this.game.addMessage('{0} attempted to use {1}, but did not successfully pay the required costs', this.context.player, this.context.source);
        }
    }

    resolveTargets() {
        if (this.cancelled) {
            return;
        }
        this.context.stage = Stage.Target;

        if (!this.context.ability.hasLegalTargets(this.context)) {
            // Ability cannot resolve, so display a message and cancel it
            this.game.addMessage('{0} attempted to use {1}, but there are insufficient legal targets', this.context.player, this.context.source);
            this.cancelled = true;
        } else if (this.targetResults.delayTargeting) {
            // Targeting was delayed due to an opponent needing to choose targets (which shouldn't happen until costs have been paid), so continue
            this.targetResults = this.context.ability.resolveRemainingTargets(this.context, this.targetResults.delayTargeting, this.passAbilityHandler);
        } else if (this.targetResults.payCostsFirst || !this.context.ability.checkAllTargets(this.context)) {
            // Targeting was stopped by the player choosing to pay costs first, or one of the chosen targets is no longer legal. Retarget from scratch
            this.targetResults = this.context.ability.resolveTargets(this.context, this.passAbilityHandler);
        }
    }

    initiateAbilityEffects() {
        if (this.cancelled) {
            for (const event of this.events) {
                event.cancel();
            }
            return;
        }

        // Increment limits (limits aren't used up on cards in hand)
        if (this.context.ability.limit && this.context.source.location !== Location.Hand &&
           (!this.context.cardStateWhenInitiated || this.context.cardStateWhenInitiated.location === this.context.source.location)) {
            this.context.ability.limit.increment(this.context.player);
        }
        if (this.context.ability.max) {
            this.context.player.incrementAbilityMax(this.context.ability.maxIdentifier);
        }
        this.context.ability.displayMessage(this.context);

        if (this.context.ability.isTriggeredAbility()) {
            // TODO EVENTS: need to remove 'BeingPlayed' reference here and just send directly to discard (should already be there since this is triggering off an already-played card)
            // If this is an event, move it to 'being played', and queue a step to send it to the discard pile after it resolves
            if (this.context.ability.isCardPlayed()) {
                this.game.actions.moveCard({ destination: Location.BeingPlayed }).resolve(this.context.source, this.context);
            }
            this.game.openAdditionalAbilityStepEventWindow(new InitiateCardAbilityEvent({ card: this.context.source, context: this.context }, () => this.initiateAbility = true));
        } else {
            this.initiateAbility = true;
        }
    }

    executeHandler() {
        if (this.cancelled || !this.initiateAbility) {
            return;
        }
        this.context.stage = Stage.Effect;
        this.context.ability.executeHandler(this.context);
    }

    moveEventCardToDiscard() {
        if (this.context.source.location === Location.BeingPlayed) {
            this.context.player.moveCard(this.context.source, Location.Discard);
        }
    }
}

module.exports = AbilityResolver;
