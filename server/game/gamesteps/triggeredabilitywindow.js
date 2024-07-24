const _ = require('underscore');

const ForcedTriggeredAbilityWindow = require('./forcedtriggeredabilitywindow.js');
const { TriggeredAbilityWindowTitle } = require('./TriggeredAbilityWindowTitle');

const { CardTypes, EventNames, AbilityTypes } = require('../Constants');

class TriggeredAbilityWindow extends ForcedTriggeredAbilityWindow {
    constructor(game, abilityType, window, eventsToExclude = []) {
        super(game, abilityType, window, eventsToExclude);
        this.complete = false;
        this.prevPlayerPassed = false;
        this.resolvedAbilitiesPerPlayer = {};
    }

    showBluffPrompt(player) {
        // Show a bluff prompt if the player has an event which could trigger (but isn't in their hand) and that setting
        if(player.timerSettings.eventsInDeck && this.choices.some(context => context.player === player)) {
            return true;
        }
        // Show a bluff prompt if we're in Step 6, the player has the approriate setting, and there's an event for the other player
        return this.abilityType === AbilityTypes.WouldInterrupt && player.timerSettings.events && _.any(this.events, event => (
            event.name === EventNames.OnInitiateAbilityEffects &&
            event.card.type === CardTypes.Event && event.context.player !== player
        ));
    }

    promptWithBluffPrompt(player) {
        this.game.promptWithMenu(player, this, {
            source: 'Triggered Abilities',
            waitingPromptTitle: 'Waiting for opponent',
            activePrompt: {
                promptTitle: TriggeredAbilityWindowTitle.getTitle(this.abilityType, this.events),
                controls: this.getPromptControls(),
                buttons: [
                    { timer: true, method: 'pass' },
                    { text: 'I need more time', timerCancel: true },
                    { text: 'Don\'t ask again until end of round', timerCancel: true, method: 'pass', arg: 'pauseRound' },
                    { text: 'Pass', method: 'pass' }
                ]
            }
        });
    }

    pass(player, arg) {
        if(arg === 'pauseRound') {
            player.noTimer = true;
            player.resetTimerAtEndOfRound = true;
        }
        if(this.prevPlayerPassed || !this.activePlayer.opponent) {
            this.complete = true;
        } else {
            this.activePlayer = this.activePlayer.opponent;
            this.prevPlayerPassed = true;
        }

        return true;
    }

    filterChoices() {
        // If both players have passed, close the window
        if(this.complete) {
            return true;
        }
        // remove any choices which involve the current player canceling their own abilities
        if(this.abilityType === AbilityTypes.WouldInterrupt && !this.activePlayer.optionSettings.cancelOwnAbilities) {
            this.choices = this.choices.filter(context => !(
                context.player === this.activePlayer &&
                context.event.name === EventNames.OnInitiateAbilityEffects &&
                context.event.context.player === this.activePlayer
            ));
        }

        // if the current player has no available choices in this window, check to see if they should get a bluff prompt
        if(!_.any(this.choices, context => context.player === this.activePlayer && context.ability.isInValidLocation(context))) {
            if(this.showBluffPrompt(this.activePlayer)) {
                this.promptWithBluffPrompt(this.activePlayer);
                return false;
            }
            // Otherwise pass
            this.pass();
            return this.filterChoices();
        }

        // Filter choices for current player, and prompt
        this.choices = _.filter(this.choices, context => context.player === this.activePlayer && context.ability.isInValidLocation(context));
        this.promptBetweenSources(this.choices);
        return false;
    }

    postResolutionUpdate(resolver) {
        super.postResolutionUpdate(resolver);
        if(!this.resolvedAbilitiesPerPlayer[resolver.context.player.uuid]) {
            this.resolvedAbilitiesPerPlayer[resolver.context.player.uuid] = [];
        }
        this.resolvedAbilitiesPerPlayer[resolver.context.player.uuid].push({ ability: resolver.context.ability, event: resolver.context.event });

        this.prevPlayerPassed = false;
        this.activePlayer = this.activePlayer.opponent || this.activePlayer;
    }

    getPromptForSelectProperties() {
        return _.extend(super.getPromptForSelectProperties(), {
            selectCard: this.activePlayer.optionSettings.markCardsUnselectable,
            buttons: [{ text: 'Pass', arg: 'pass' }],
            onMenuCommand: (player, arg) => {
                this.pass(player, arg);
                return true;
            }
        });
    }

    hasAbilityBeenTriggered(context) {
        let alreadyResolved = false;
        if(Array.isArray(this.resolvedAbilitiesPerPlayer[context.player.uuid])) {
            alreadyResolved = this.resolvedAbilitiesPerPlayer[context.player.uuid].some(resolved => resolved.ability === context.ability && (context.ability.collectiveTrigger || resolved.event === context.event));
        }
        return alreadyResolved;
    }
}

module.exports = TriggeredAbilityWindow;