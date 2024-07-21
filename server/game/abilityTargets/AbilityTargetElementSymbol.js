const CardSelector = require('../CardSelector.js');
const { CardTypes, Stages, Players, Locations } = require('../Constants.js');

class AbilityTargetElementSymbol {
    constructor(name, properties, ability) {
        this.name = name;
        this.properties = properties;
        this.properties.location = this.properties.location || Locations.PlayArea;
        this.selector = this.getSelector(properties);
        for(let gameAction of this.properties.gameAction) {
            gameAction.setDefaultTarget(context => context.elements[name]);
        }
        this.dependentTarget = null;
        this.dependentCost = null;
        if(this.properties.dependsOn) {
            let dependsOnTarget = ability.targets.find(target => target.name === this.properties.dependsOn);
            dependsOnTarget.dependentTarget = this;
        }
    }

    getSelector(properties) {
        let cardCondition = card => {
            if(!card.isInPlay()) {
                return false;
            }
            let elements = card.getCurrentElementSymbols();
            if(elements.length === 0) {
                return false;
            }
            return true; // cheating, this is only used for Twin Soul Temple and the action is always valid if it has an element

            // let contextCopy = context.copy();
            // contextCopy.elements[this.name] = elements;
            // if(this.name === 'target') {
            //     contextCopy.element = elements;
            // }
            // if(context.stage === Stages.PreTarget && this.dependentCost && !this.dependentCost.canPay(contextCopy)) {
            //     return false;
            // }

            // return (!this.dependentTarget || this.dependentTarget.hasLegalTarget(contextCopy)) &&
            //         (properties.gameAction.length === 0 || properties.gameAction.some(gameAction => gameAction.hasLegalTarget(contextCopy)));
        };
        let cardType = properties.cardType || [CardTypes.Attachment, CardTypes.Character, CardTypes.Event, CardTypes.Holding, CardTypes.Province, CardTypes.Role, CardTypes.Stronghold];
        return CardSelector.for(Object.assign({}, properties, { cardType: cardType, cardCondition: cardCondition, targets: false }));
    }

    canResolve(context) {
        return !!this.properties.dependsOn || this.hasLegalTarget(context);
    }

    hasLegalTarget(context) {
        return this.selector.optional || this.selector.hasEnoughTargets(context, this.getChoosingPlayer(context));
    }

    getAllLegalTargets(context) {
        return this.selector.getAllLegalTargets(context, this.getChoosingPlayer(context));
    }

    getGameAction(context) {
        return this.properties.gameAction.filter(gameAction => gameAction.hasLegalTarget(context));
    }

    resolve(context, targetResults) {
        if(targetResults.cancelled || targetResults.payCostsFirst || targetResults.delayTargeting) {
            return;
        }
        let player = context.choosingPlayerOverride || this.getChoosingPlayer(context);
        if(player === context.player.opponent && context.stage === Stages.PreTarget) {
            targetResults.delayTargeting = this;
            return;
        }
        let buttons = [];
        let waitingPromptTitle = '';
        if(context.stage === Stages.PreTarget) {
            buttons.push({ text: 'Cancel', arg: 'cancel' });
            if(context.ability.abilityType === 'action') {
                waitingPromptTitle = 'Waiting for opponent to take an action or pass';
            } else {
                waitingPromptTitle = 'Waiting for opponent';
            }
        }
        let promptProperties = {
            waitingPromptTitle: waitingPromptTitle,
            buttons: buttons,
            context: context,
            selector: this.selector,
            onSelect: (player, card) => {
                let validElements = card.getCurrentElementSymbols();
                context.elementCard = card;
                if(validElements.length > 1) {
                    const choices = validElements.map(element => `${element.prettyName} (${element.element})`);
                    const handlers = validElements.map(element => {
                        return () => {
                            context.elements[this.name] = element;
                            if(this.name === 'target') {
                                context.element = element;
                            }
                        };
                    });
                    context.game.promptWithHandlerMenu(player, {
                        activePromptTitle: 'Which element do you wish to select?',
                        choices: choices,
                        handlers: handlers,
                        context: context
                    });
                } else {
                    context.elements[this.name] = validElements[0];
                    if(this.name === 'target') {
                        context.element = validElements[0];
                    }
                }
                return true;
            },
            onCancel: () => {
                targetResults.cancelled = true;
                return true;
            },
            onMenuCommand: (player, arg) => {
                if(arg === 'costsFirst') {
                    targetResults.costsFirst = true;
                    return true;
                }
                return true;
            }
        };
        context.game.promptForSelect(player, Object.assign(promptProperties, this.properties));
    }

    checkTarget(context) {
        if(!context.elementCard || context.choosingPlayerOverride && this.getChoosingPlayer(context) === context.player) {
            return false;
        }
        return this.selector.canTarget(context.elementCard, context);
    }

    getChoosingPlayer(context) {
        let playerProp = this.properties.player;
        if(typeof playerProp === 'function') {
            playerProp = playerProp(context);
        }
        return playerProp === Players.Opponent ? context.player.opponent : context.player;
    }

    hasTargetsChosenByInitiatingPlayer(context) {
        if(this.properties.gameAction.some(action => action.hasTargetsChosenByInitiatingPlayer(context))) {
            return true;
        }
        return this.getChoosingPlayer(context) === context.player;
    }
}

module.exports = AbilityTargetElementSymbol;
