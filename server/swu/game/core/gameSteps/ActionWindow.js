const { UiPrompt } = require('./prompts/UiPrompt.js');
const { EventNames, Locations, Players, EffectNames, isArena, WildcardLocations } = require('../Constants.js');

class ActionWindow extends UiPrompt {
    constructor(game, title, windowName, activePlayer = null) {
        super(game);

        this.title = title;
        this.windowName = windowName;
        this.activePlayer = activePlayer ?? this.game.initiativePlayer;
        this.activePlayerConsecutiveActions = 0;
        this.opportunityCounter = 0;
        this.prevPlayerPassed = false;
    }

    activeCondition(player) {
        return player === this.activePlayer;
    }

    onCardClicked(player, card) {
        if(player !== this.activePlayer) {
            return false;
        }

        let actions = card.getActions();

        let legalActions = actions.filter(action => action.meetsRequirements(action.createContext(player)) === '');

        if(legalActions.length === 0) {
            return false;
        } else if(legalActions.length === 1) {
            let action = legalActions[0];
            let targetPrompts = action.targets.some(target => target.properties.player !== Players.Opponent);
            if(!this.activePlayer.optionSettings.confirmOneClick || action.cost.some(cost => cost.promptsPlayer) || targetPrompts) {
                this.resolveAbility(action.createContext(player));
                return true;
            }
        }
        this.game.promptWithHandlerMenu(player, {
            // TODO: add more specific logic for card location - e.g., smuggle prompt will be here
            activePromptTitle: (isArena(card.location) ? 'Choose an ability:' : 'Play ' + card.name + ':'),
            source: card,
            choices: legalActions.map(action => action.title).concat('Cancel'),
            handlers: legalActions.map(action => (() => this.resolveAbility(action.createContext(player)))).concat(() => true)
        });
        return true;
    }

    resolveAbility(context) {
        const resolver = this.game.resolveAbility(context);
        this.game.queueSimpleStep(() => {
            if(resolver.passPriority) {
                this.postResolutionUpdate(resolver);
            }
        });
    }

    postResolutionUpdate(resolver) { // eslint-disable-line no-unused-vars
        this.prevPlayerPassed = false;

        // TODO: is this right? need to investigate for e.g. Leia hero ability
        if(this.activePlayerConsecutiveActions > 1) {
            this.markBonusActionsTaken();
        }
    }

    // TODO: this is probably wrong
    continue() {
        // TODO: do we need promptedActionWindows?
        if(!this.activePlayer.promptedActionWindows[this.windowName]) {
            this.pass();
        }

        let completed = super.continue();

        if(!completed) {
            this.game.currentActionWindow = this;
        } else {
            this.game.currentActionWindow = null;
        }
        return completed;
    }

    // TODO: add claim initiative option here
    activePrompt() {
        let buttons = [
            { text: 'Pass', arg: 'pass' }
        ];
        if(this.game.manualMode) {
            buttons.unshift({ text: 'Manual Action', arg: 'manual'});
        }
        return {
            menuTitle: 'Initiate an action',
            buttons: buttons,
            promptTitle: this.title
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to take an action or pass' };
    }

    menuCommand(player, choice) {
        if(choice === 'manual') {
            this.game.promptForSelect(this.activePlayer, {
                source: 'Manual Action',
                activePrompt: 'Which ability are you using?',
                location: WildcardLocations.Any,
                controller: Players.Self,
                cardCondition: card => card.isFaceup() || card.canBeSmuggled(),
                onSelect: (player, card) => {
                    this.game.addMessage('{0} uses {1}\'s ability', player, card);
                    this.prevPlayerPassed = false;
                    return true;
                }
            });
            return true;
        }

        if(choice === 'pass') {
            this.pass();
            return true;
        }
    }

    markBonusActionsTaken() {
        if (this.bonusActions) {
            this.bonusActions[this.activePlayer.uuid].actionsTaken = true;
        }
    }

    pass() {
        this.game.addMessage('{0} passes', this.activePlayer);

        if(!this.activePlayer.opponent) {
            this.attemptComplete();
            return;
        }

        // TODO: is this right? need to investigate for e.g. Leia hero ability
        if(this.activePlayerConsecutiveActions > 1) {
            this.markBonusActionsTaken();
        }
    }

    attemptComplete() {
        if (!this.activePlayer.opponent) {
            this.complete();
        }

        if (!this.checkBonusActions()) {
            this.complete();
        }
    }

    // TODO: figure out what's up with this
    checkBonusActions() {
        if (!this.bonusActions) {
            if (!this.setupBonusActions()) {
                return false;
            }
        }

        const player1 = this.game.initiativePlayer();
        const player2 = player1.opponent;

        const p1 = this.bonusActions[player1.uuid];
        const p2 = this.bonusActions[player2.uuid];

        if (p1.actionCount > 0) {
            if (!p1.actionsTaken) {
                this.game.addMessage('{0} has a bonus action during resolution!', player1);
                this.prevPlayerPassed = false;
                // Set the current player to player1
                if (this.activePlayer !== player1) {
                    this.activePlayer = player1;
                }
                return true;
            }
        }
        if (p2.actionCount > 0) {
            if (!p2.actionsTaken) {
                this.game.addMessage('{0} has a bonus action during resolution!', player2);
                this.prevPlayerPassed = false;
                // Set the current player to player2
                if (this.activePlayer !== player2) {
                    this.activePlayer = player2;
                }
                return true;
            }
        }

        return false;
    }

    setupBonusActions() {
        const player1 = this.game.initiativePlayer;
        const player2 = player1.opponent;
        let p1ActionsPostWindow = player1.sumEffects(EffectNames.AdditionalActionAfterWindowCompleted);
        let p2ActionsPostWindow = player2.sumEffects(EffectNames.AdditionalActionAfterWindowCompleted);

        this.bonusActions = {
            [player1.uuid]: {
                actionCount: p1ActionsPostWindow,
                actionsTaken: false
            },
            [player2.uuid]: {
                actionCount: p2ActionsPostWindow,
                actionsTaken: false
            },
        }

        return p1ActionsPostWindow + p2ActionsPostWindow > 0;
    }

    teardownBonusActions() {
        this.bonusActions = undefined;
    }

    complete() {
        this.teardownBonusActions();
        super.complete();
    }
}

module.exports = ActionWindow;
