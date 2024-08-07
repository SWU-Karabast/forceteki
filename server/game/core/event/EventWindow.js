const _ = require('underscore');

const { BaseStepWithPipeline } = require('../gameSteps/BaseStepWithPipeline.js');
const ForcedTriggeredAbilityWindow = require('../gameSteps/abilityWindow/ForcedTriggeredAbilityWindow.js');
const { SimpleStep } = require('../gameSteps/SimpleStep.js');
const TriggeredAbilityWindow = require('../gameSteps/abilityWindow/TriggeredAbilityWindow.js');
const { AbilityType } = require('../Constants.js');
// const KeywordAbilityWindow = require('../gamesteps/keywordabilitywindow.js');

class EventWindow extends BaseStepWithPipeline {
    constructor(game, events) {
        super(game);

        this.events = [];
        this.additionalAbilitySteps = [];
        _.each(events, (event) => {
            if (!event.cancelled) {
                this.addEvent(event);
            }
        });

        this.initialise();
    }

    initialise() {
        this.pipeline.initialise([
            new SimpleStep(this.game, () => this.setCurrentEventWindow()),
            new SimpleStep(this.game, () => this.checkEventCondition()),
            new SimpleStep(this.game, () => this.openWindow(AbilityType.WouldInterrupt)),
            new SimpleStep(this.game, () => this.createContingentEvents()),
            new SimpleStep(this.game, () => this.openWindow(AbilityType.ForcedInterrupt)),
            new SimpleStep(this.game, () => this.openWindow(AbilityType.Interrupt)),
            // new SimpleStep(this.game, () => this.checkKeywordAbilities(AbilityType.KeywordInterrupt)),
            new SimpleStep(this.game, () => this.checkForOtherEffects()),
            new SimpleStep(this.game, () => this.preResolutionEffects()),
            new SimpleStep(this.game, () => this.executeHandler()),
            // new SimpleStep(this.game, () => this.checkGameState()),
            // new SimpleStep(this.game, () => this.checkKeywordAbilities(AbilityType.KeywordReaction)),
            // new SimpleStep(this.game, () => this.checkAdditionalAbilitySteps()),
            new SimpleStep(this.game, () => this.openWindow(AbilityType.ForcedReaction)),
            new SimpleStep(this.game, () => this.openWindow(AbilityType.Reaction)),
            new SimpleStep(this.game, () => this.resetCurrentEventWindow())
        ]);
    }

    addEvent(event) {
        event.setWindow(this);
        this.events.push(event);
        return event;
    }

    removeEvent(event) {
        this.events = _.reject(this.events, (e) => e === event);
        return event;
    }

    addCardAbilityStep(ability, context, condition = (event) => event.isFullyResolved(event)) {
        this.additionalAbilitySteps.push({ ability, context, condition });
    }

    setCurrentEventWindow() {
        this.previousEventWindow = this.game.currentEventWindow;
        this.game.currentEventWindow = this;
    }

    checkEventCondition() {
        _.each(this.events, (event) => event.checkCondition());
    }

    openWindow(abilityType) {
        if (_.isEmpty(this.events)) {
            return;
        }

        if ([AbilityType.ForcedReaction, AbilityType.ForcedInterrupt].includes(abilityType)) {
            this.queueStep(new ForcedTriggeredAbilityWindow(this.game, abilityType, this));
        } else {
            this.queueStep(new TriggeredAbilityWindow(this.game, abilityType, this));
        }
    }

    // This is primarily for LeavesPlayEvents
    createContingentEvents() {
        let contingentEvents = [];
        _.each(this.events, (event) => {
            contingentEvents = contingentEvents.concat(event.createContingentEvents());
        });
        if (contingentEvents.length > 0) {
            // Exclude current events from the new window, we just want to give players opportunities to respond to the contingent events
            this.queueStep(new TriggeredAbilityWindow(this.game, AbilityType.WouldInterrupt, this, this.events.slice(0)));
            _.each(contingentEvents, (event) => this.addEvent(event));
        }
    }

    // This catches any persistent/delayed effect cancels
    checkForOtherEffects() {
        _.each(this.events, (event) => this.game.emit(event.name + ':' + AbilityType.OtherEffects, event));
    }

    preResolutionEffects() {
        _.each(this.events, (event) => event.preResolutionEffect());
    }

    executeHandler() {
        this.eventsToExecute = _.sortBy(this.events, 'order');

        _.each(this.eventsToExecute, (event) => {
            // need to checkCondition here to ensure the event won't fizzle due to another event's resolution (e.g. double honoring an ordinary character with YR etc.)
            event.checkCondition();
            if (!event.cancelled) {
                event.executeHandler();
                this.game.emit(event.name, event);
            }
        });
    }

    // checkGameState() {
    //     this.eventsToExecute = this.eventsToExecute.filter(event => !event.cancelled);
    //     this.game.checkGameState(_.any(this.eventsToExecute, event => event.handler), this.eventsToExecute);
    // }

    // checkKeywordAbilities(abilityType) {
    //     if(_.isEmpty(this.events)) {
    //         return;
    //     }

    //     this.queueStep(new KeywordAbilityWindow(this.game, abilityType, this));
    // }

    // TODO: what's up with 'then' abilities
    // checkAdditionalAbilitySteps() {
    //     for(const cardAbilityStep of this.additionalAbilitySteps) {
    //         if(cardAbilityStep.context.events.every(event => cardAbilityStep.condition(event))) {
    //             this.game.resolveAbility(cardAbilityStep.ability.createContext(cardAbilityStep.context.player));
    //         }
    //     }
    // }

    resetCurrentEventWindow() {
        if (this.previousEventWindow) {
            this.previousEventWindow.checkEventCondition();
            this.game.currentEventWindow = this.previousEventWindow;
        } else {
            this.game.currentEventWindow = null;
        }
    }
}

module.exports = EventWindow;
