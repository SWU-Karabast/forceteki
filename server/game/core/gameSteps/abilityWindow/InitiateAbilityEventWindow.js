const _ = require('underscore');
const EventWindow = require('../../event/EventWindow.js');
const TriggeredAbilityWindow = require('./TriggeredAbilityWindow.js');
const { EventName, AbilityType } = require('../../Constants.js');

class InitiateAbilityInterruptWindow extends TriggeredAbilityWindow {
    constructor(game, abilityType, eventWindow) {
        super(game, abilityType, eventWindow);
        this.playEvent = eventWindow.events.find((event) => event.name === EventName.OnCardPlayed);
    }

    /** @override */
    getPromptForSelectProperties() {
        let buttons = [];
        if (this.playEvent && this.activePlayer === this.playEvent.player && this.playEvent.resolver.canCancel) {
            buttons.push({ text: 'Cancel', arg: 'cancel' });
        }
        if (this.getMinCostReduction() === 0) {
            buttons.push({ text: 'Pass', arg: 'pass' });
        }
        return Object.assign(super.getPromptForSelectProperties(), {
            buttons: buttons,
            onCancel: () => {
                this.playEvent.resolver.cancelled = true;
                this.complete = true;
            }
        });
    }

    getMinCostReduction() {
        if (this.playEvent) {
            const context = this.playEvent.context;
            const alternatePools = context.player.getAlternateFatePools(this.playEvent.playType, context.source, context);
            const alternatePoolTotal = alternatePools.reduce((total, pool) => total + pool.fate, 0);
            const maxPlayerFate = context.player.checkRestrictions('spendFate', context) ? context.player.fate : 0;
            return Math.max(context.ability.getReducedCost(context) - maxPlayerFate - alternatePoolTotal, 0);
        }
        return 0;
    }

    /** @override */
    resolveAbility(context) {
        if (this.playEvent) {
            this.playEvent.resolver.canCancel = false;
        }
        return super.resolveAbility(context);
    }
}

class InitiateAbilityEventWindow extends EventWindow {
    /** @override */
    openWindow(abilityType) {
        if (this.events.length && abilityType === AbilityType.Interrupt) {
            this.queueStep(new InitiateAbilityInterruptWindow(this.game, abilityType, this));
        } else {
            super.openWindow(abilityType);
        }
    }

    /** @override */
    executeHandler() {
        this.eventsToExecute = _.sortBy(this.events, 'order');

        _.each(this.eventsToExecute, (event) => {
            event.checkCondition();
            if (!event.cancelled) {
                event.executeHandler();
            }
        });

        // We need to separate executing the handler and emitting events as in this window, the handler just
        // queues ability resolution steps, and we don't want the events to be emitted until step 8
        this.game.queueSimpleStep(() => this.emitEvents());
    }

    emitEvents() {
        this.eventsToExecute = this.eventsToExecute.filter((event) => !event.cancelled);
        _.each(this.eventsToExecute, (event) => this.game.emit(event.name, event));
    }
}

module.exports = InitiateAbilityEventWindow;
