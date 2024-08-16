const { BaseStepWithPipeline } = require('../gameSteps/BaseStepWithPipeline.js');
const { TriggeredAbilityWindow } = require('../gameSteps/abilityWindow/TriggeredAbilityWindow');
const { SimpleStep } = require('../gameSteps/SimpleStep.js');
const { AbilityType } = require('../Constants.js');
// const KeywordAbilityWindow = require('../gamesteps/keywordabilitywindow.js');

class EventWindow extends BaseStepWithPipeline {
    constructor(game, events) {
        super(game);

        this.events = [];
        this.additionalAbilitySteps = [];
        events.forEach((event) => {
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
            // new SimpleStep(this.game, () => this.createContingentEvents()),
            // new SimpleStep(this.game, () => this.checkKeywordAbilities(AbilityType.KeywordInterrupt)),
            new SimpleStep(this.game, () => this.checkForOtherEffects()),
            new SimpleStep(this.game, () => this.preResolutionEffects()),
            new SimpleStep(this.game, () => this.executeHandler()),
            // new SimpleStep(this.game, () => this.resolveGameState()),
            // new SimpleStep(this.game, () => this.checkKeywordAbilities(AbilityType.KeywordReaction)),
            // new SimpleStep(this.game, () => this.checkAdditionalAbilitySteps()),
            new SimpleStep(this.game, () => this.openWindow(AbilityType.TriggeredAbility)),
            new SimpleStep(this.game, () => this.resetCurrentEventWindow())
        ]);
    }

    addEvent(event) {
        event.setWindow(this);
        this.events.push(event);
        return event;
    }

    removeEvent(event) {
        this.events = this.events.filter((e) => e !== event);
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
        this.events.forEach((event) => event.checkCondition());
    }

    openWindow(abilityType) {
        if (this.events.length === 0) {
            return;
        }

        // TODO EFFECTS: will need resolution for replacement effects here
        // not sure if it will need a new window class or can just reuse the existing one
        if (abilityType === AbilityType.TriggeredAbility) {
            this.queueStep(new TriggeredAbilityWindow(this.game, this));
        }
    }

    // TODO: do we need this?
    // // This is primarily for LeavesPlayEvents
    // createContingentEvents() {
    //     let contingentEvents = [];
    //     this.events.forEach((event) => {
    //         contingentEvents = contingentEvents.concat(event.createContingentEvents());
    //     });
    //     if (contingentEvents.length > 0) {
    //         // Exclude current events from the new window, we just want to give players opportunities to respond to the contingent events
    //         this.queueStep(new TriggeredAbilityWindow(this.game, AbilityType.WouldInterrupt, this, this.events.slice(0)));
    //         _.each(contingentEvents, (event) => this.addEvent(event));
    //     }
    // }

    // This catches any persistent/delayed effect cancels
    checkForOtherEffects() {
        this.events.forEach((event) => this.game.emit(event.name + ':' + AbilityType.OtherEffects, event));
    }

    preResolutionEffects() {
        this.events.forEach((event) => event.preResolutionEffect());
    }

    executeHandler() {
        this.eventsToExecute = this.events.sort((event) => event.order);

        this.eventsToExecute.forEach((event) => {
            // need to checkCondition here to ensure the event won't fizzle due to another event's resolution (e.g. double honoring an ordinary character with YR etc.)
            event.checkCondition();
            if (!event.cancelled) {
                event.executeHandler();
                this.game.emit(event.name, event);
            }
        });
    }

    // resolveGameState() {
    //     this.eventsToExecute = this.eventsToExecute.filter((event) => !event.cancelled);
    //     this.game.resolveGameState(_.any(this.eventsToExecute, (event) => event.handler), this.eventsToExecute);
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
