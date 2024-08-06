const { UiPrompt } = require('./UiPrompt.js');
const { EventNames, Locations, Players, EffectNames } = require('../Constants');

class ActionWindow extends UiPrompt {
    constructor(game, title, windowName) {
        super(game);

        this.title = title;
        this.windowName = windowName;
        if(this.game.currentConflict && !this.game.currentConflict.isSinglePlayer) {
            this.currentPlayer = this.game.currentConflict.defendingPlayer;
        } else {
            this.currentPlayer = game.getFirstPlayer();
        }
        this.currentPlayerConsecutiveActions = 0;
        this.opportunityCounter = 0;
        this.prevPlayerPassed = false;
    }

    activeCondition(player) {
        return player === this.currentPlayer;
    }

    onCardClicked(player, card) {
        if(player !== this.currentPlayer) {
            return false;
        }

        let actions = card.getActions();

        let legalActions = actions.filter(action => action.meetsRequirements(action.createContext(player)) === '');

        if(legalActions.length === 0) {
            return false;
        } else if(legalActions.length === 1) {
            let action = legalActions[0];
            let targetPrompts = action.targets.some(target => target.properties.player !== Players.Opponent);
            if(!this.currentPlayer.optionSettings.confirmOneClick || action.cost.some(cost => cost.promptsPlayer) || targetPrompts) {
                this.resolveAbility(action.createContext(player));
                return true;
            }
        }
        this.game.promptWithHandlerMenu(player, {
            activePromptTitle: (card.location === Locations.PlayArea ? 'Choose an ability:' : 'Play ' + card.name + ':'),
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
        this.currentPlayerConsecutiveActions += 1;
        this.prevPlayerPassed = false;
        let allowableConsecutiveActions = this.getCurrentPlayerConsecutiveActions();

        if(this.currentPlayerConsecutiveActions > allowableConsecutiveActions) {
            this.markBonusActionsTaken();
            this.nextPlayer();
        }
    }

    continue() {
        if (this.currentPlayer.opponent) {
            if (this.currentPlayer.opponent.actionPhasePriority && this.currentPlayer.actionPhasePriority) {
                // Both players have action phase priority, don't do anything, it'll clear on its own
            } else if (this.currentPlayer.opponent.actionPhasePriority && !this.currentPlayer.actionPhasePriority) {
                this.currentPlayer = this.currentPlayer.opponent;
            } else if (this.currentPlayer.isDefendingPlayer()) {
                this.currentPlayer.actionPhasePriority = false;
            }
        } else {
            this.currentPlayer.actionPhasePriority = false;
        }

        if(!this.currentPlayer.promptedActionWindows[this.windowName]) {
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
            this.game.promptForSelect(this.currentPlayer, {
                source: 'Manual Action',
                activePrompt: 'Which ability are you using?',
                location: Locations.Any,
                controller: Players.Self,
                cardCondition: card => card.isFaceup(),
                onSelect: (player, card) => {
                    this.game.addMessage('{0} uses {1}\'s ability', player, card);
                    this.prevPlayerPassed = false;
                    this.nextPlayer();
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

    getCurrentPlayerConsecutiveActions() {
        let allowableConsecutiveActions = this.currentPlayer.sumEffects(EffectNames.AdditionalAction); 
        if (this.bonusActions) {
            const bonusActions = this.bonusActions[this.currentPlayer.uuid];
            if (!bonusActions.actionsTaken && bonusActions.takingActions && bonusActions.actionCount > 0) {
                allowableConsecutiveActions = allowableConsecutiveActions + (bonusActions?.actionCount - 1);
            }
        }
        if (this.currentPlayer.actionPhasePriority) {
            if (allowableConsecutiveActions > 0) {
                allowableConsecutiveActions--;
            }
        }
        return allowableConsecutiveActions;
    }

    markBonusActionsTaken() {
        if (this.bonusActions) {
            this.bonusActions[this.currentPlayer.uuid].actionsTaken = true;
            this.bonusActions[this.currentPlayer.uuid].takingActions = false;
        }
    }

    pass() {
        this.game.addMessage('{0} passes', this.currentPlayer);

        if(this.prevPlayerPassed || !this.currentPlayer.opponent) {
            this.attemptComplete();
            return;
        }

        this.currentPlayerConsecutiveActions += 1;
        let allowableConsecutiveActions = this.getCurrentPlayerConsecutiveActions();

        if(this.currentPlayerConsecutiveActions > allowableConsecutiveActions) {
            this.markBonusActionsTaken();
            this.prevPlayerPassed = true;
            this.nextPlayer();
        }
    }

    attemptComplete() {
        if (!this.currentPlayer.opponent) {
            this.complete();
        }

        if (!this.checkBonusActions()) {
            this.complete();
        }
    }

    checkBonusActions() {
        if (!this.bonusActions) {
            if (!this.setupBonusActions()) {
                return false;
            }
        }

        const player1 = this.game.getFirstPlayer();
        const player2 = player1.opponent;

        const p1 = this.bonusActions[player1.uuid];
        const p2 = this.bonusActions[player2.uuid];

        if (p1.actionCount > 0) {
            if (!p1.actionsTaken) {
                this.game.addMessage('{0} has a bonus action during resolution!', player1);
                this.prevPlayerPassed = false;
                // Set the current player to player1
                if (this.currentPlayer !== player1) {
                    this.currentPlayer = player1;
                }
                p1.takingActions = true;
                return true;
            }
        }
        if (p2.actionCount > 0) {
            if (!p2.actionsTaken) {
                this.game.addMessage('{0} has a bonus action during resolution!', player2);
                this.prevPlayerPassed = false;
                // Set the current player to player1
                if (this.currentPlayer !== player2) {
                    this.currentPlayer = player2;
                }
                p2.takingActions = true;
                return true;
            }
        }

        return false;
    }

    setupBonusActions() {
        const player1 = this.game.getFirstPlayer();
        const player2 = player1.opponent;
        let p1ActionsPostWindow = player1.sumEffects(EffectNames.AdditionalActionAfterWindowCompleted);
        let p2ActionsPostWindow = player2.sumEffects(EffectNames.AdditionalActionAfterWindowCompleted);

        this.bonusActions = {
            [player1.uuid]: {
                actionCount: p1ActionsPostWindow,
                actionsTaken: false,
                takingActions: false
            },
            [player2.uuid]: {
                actionCount: p2ActionsPostWindow,
                actionsTaken: false,
                takingActions: false
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

    nextPlayer() {
        let otherPlayer = this.game.getOtherPlayer(this.currentPlayer);

        this.currentPlayer.actionPhasePriority = false;

        if(this.currentPlayer.anyEffect(EffectNames.ResolveConflictEarly) || this.bonusActions) {
            this.attemptComplete();
            return;
        }

        if(otherPlayer) {
            this.game.raiseEvent(
                EventNames.OnPassActionPhasePriority,
                { player: this.currentPlayer, consecutiveActions: this.currentPlayerConsecutiveActions, actionWindow: this },
                () => {
                    this.currentPlayer = otherPlayer;
                    this.opportunityCounter += 1;
                    this.currentPlayerConsecutiveActions = 0;
                }
            );
        }
    }
}

module.exports = ActionWindow;
