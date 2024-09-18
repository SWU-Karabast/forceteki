const { BaseStepWithPipeline } = require('./BaseStepWithPipeline.js');
const { SimpleStep } = require('./SimpleStep.js');
const InitiateCardAbilityEvent = require('../event/InitiateCardAbilityEvent.js');
const InitiateAbilityEventWindow = require('./abilityWindow/InitiateAbilityEventWindow.js');
const { Location, Stage, CardType, EventName, AbilityType } = require('../Constants.js');
const { GameEvent } = require('../event/GameEvent.js');

class AbilityResolver extends BaseStepWithPipeline {
    constructor(game, context, optional = false) {
        super(game);

        this.context = context;
        this.canCancel = true;
        this.initiateAbility = false;
        this.events = [];
        this.targetResults = {};
        this.costResults = this.getCostResults();
        this.initialise();

        /** Indicates that we should skip all remaining ability resolution steps */
        this.cancelled = false;

        /**
         * Indicates to the calling pipeline that this ability is done resolving.
         * Otherwise, repeat ability resolution (e.g. if the user clicked "cancel" halfway through)
         */
        this.resolutionComplete = false;

        // this is used when a triggered ability is marked optional to ensure that a "Pass" button
        // appears at the appropriate times during the prompt flow for that ability
        // TODO: add interface for this in Interfaces.ts when we convert to TS
        this.passAbilityHandler = (!!this.context.ability.optional || optional) ? {
            buttonText: 'Pass ability',
            arg: 'passAbility',
            hasBeenShown: false,
            handler: () => {
                this.cancelled = true;
                this.resolutionComplete = true;
            }
        } : null;

        // UP NEXT: handle then effects here (add them here and execute them even if the ability is cancelled)
    }

    initialise() {
        this.pipeline.initialise([
            // new SimpleStep(this.game, () => this.createSnapshot()),
            new SimpleStep(this.game, () => this.checkAbility(), 'checkAbility'),
            new SimpleStep(this.game, () => this.resolveEarlyTargets(), 'resolveEarlyTargets'),
            new SimpleStep(this.game, () => this.checkForCancelOrPass(), 'checkForCancelOrPass'),
            new SimpleStep(this.game, () => this.openInitiateAbilityEventWindow(), 'openInitiateAbilityEventWindow'),
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
        let resolveTriggersAfter = false;
        if (this.context.ability.isCardAbility()) {
            eventName = EventName.OnCardAbilityInitiated;
            eventProps = {
                card: this.context.source,
                ability: this.context.ability,
                context: this.context
            };
            if (this.context.ability.isCardPlayed()) {
                resolveTriggersAfter = true;
                this.events.push(new GameEvent(EventName.OnCardPlayed, {
                    player: this.context.player,
                    card: this.context.source,
                    context: this.context,
                    originalLocation: this.context.source.location,
                    originallyOnTopOfDeck:
                        this.context.player && this.context.player.drawDeck && this.context.player.drawDeck[0] === this.context.source,
                    onPlayCardSource: this.context.onPlayCardSource,
                    playType: this.context.playType,
                    resolver: this
                }));
            }
            if (this.context.ability.isActivatedAbility()) {
                resolveTriggersAfter = true;
                this.events.push(new GameEvent(EventName.OnCardAbilityTriggered, {
                    player: this.context.player,
                    card: this.context.source,
                    context: this.context
                }));
            }
        }
        this.events.push(new GameEvent(eventName, eventProps, () => this.queueInitiateAbilitySteps()));
        this.game.queueStep(new InitiateAbilityEventWindow(this.game, this.events, resolveTriggersAfter));
    }

    queueInitiateAbilitySteps() {
        this.game.queueSimpleStep(() => this.resolveCosts(), 'resolveCosts');
        this.game.queueSimpleStep(() => this.payCosts(), 'payCosts');
        this.game.queueSimpleStep(() => this.checkCostsWerePaid(), 'checkCostsWerePaid');
        this.game.queueSimpleStep(() => this.resolveTargets(), 'resolveTargets');
        this.game.queueSimpleStep(() => this.checkForCancel(), 'checkForCancel');
        this.game.queueSimpleStep(() => this.initiateAbilityEffects(), 'initiateAbilityEffects');
        this.game.queueSimpleStep(() => this.executeHandler(), 'executeHandler');
    }

    checkAbility() {
        if (this.cancelled) {
            return;
        }

        this.context.stage = Stage.PreTarget;

        // if there is no effect and no costs, we can safely skip ability resolution
        if (
            this.context.ability.meetsRequirements(this.context, ['cost']) !== '' &&
            (this.context.ability.cost == null ||
            Array.isArray(this.context.ability.cost) && this.context.ability.cost.length === 0)
        ) {
            this.game.addMessage('Ability \'{0}\' on card {1} has no impact on game state so it is passed', this.context.ability.title, this.context.source.title);
            this.cancelled = true;
            this.resolutionComplete = true;
        }
    }

    resolveEarlyTargets() {
        if (this.cancelled) {
            return;
        }

        if (!this.context.ability.cannotTargetFirst) {
            this.targetResults = this.context.ability.resolveTargets(this.context, this.passAbilityHandler);
        }
    }

    checkForCancel() {
        if (this.cancelled) {
            return;
        }

        this.cancelled = this.targetResults.cancelled;
    }

    checkForCancelOrPass() {
        if (this.cancelled) {
            return;
        }

        if (this.passAbilityHandler && !this.passAbilityHandler.hasBeenShown) {
            this.game.queueSimpleStep(() => this.checkForPass(), 'checkForPass');
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
                activePromptTitle: `Trigger the ability '${this.context.ability.title}' or pass`,
                choices: [this.context.ability.title, 'Pass'],
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

        this.resolutionComplete = true;
        if (this.costResults.events.length > 0) {
            this.game.openEventWindow(this.costResults.events);
        }
    }

    checkCostsWerePaid() {
        if (this.cancelled) {
            return;
        }
        this.cancelled = this.costResults.events.some((event) => event.getResolutionEvent().cancelled);
        if (this.cancelled) {
            this.game.addMessage('{0} attempted to use {1}, but did not successfully pay the required costs', this.context.player, this.context.source);
        }
    }

    resolveTargets() {
        if (this.cancelled) {
            return;
        }
        this.context.stage = Stage.Target;

        if (this.context.ability.hasTargets() && !this.context.ability.hasSomeLegalTarget(this.context)) {
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
        this.context.ability.displayMessage(this.context);

        // If this is an event, move it to discard before resolving the ability
        if (this.context.ability.isCardPlayed() && this.context.ability.card.isEvent()) {
            this.game.actions.moveCard({ destination: Location.Discard }).resolve(this.context.source, this.context);
        }

        if (this.context.ability.isActivatedAbility()) {
            this.game.openThenEventWindow(new InitiateCardAbilityEvent({ card: this.context.source, context: this.context }, () => this.initiateAbility = true));
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

    /** @override */
    toString() {
        return `'AbilityResolver: ${this.context.ability}'`;
    }
}

module.exports = AbilityResolver;
