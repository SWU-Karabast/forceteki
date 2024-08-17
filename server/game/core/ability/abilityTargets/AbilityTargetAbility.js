const CardSelector = require('../../cardSelector/CardSelector.js');
const { Stage, RelativePlayer } = require('../../Constants.js');
const { default: Contract } = require('../../utils/Contract.js');

class AbilityTargetAbility {
    constructor(name, properties, ability) {
        this.name = name;
        this.properties = properties;
        this.abilityCondition = properties.abilityCondition || (() => true);
        this.selector = this.getSelector(properties);
        this.dependentTarget = null;
        this.dependentCost = null;
        if (this.properties.dependsOn) {
            let dependsOnTarget = ability.targetResolvers.find((target) => target.name === this.properties.dependsOn);

            // assert that the target we depend on actually exists
            if (!Contract.assertNotNullLike(dependsOnTarget)) {
                return null;
            }

            dependsOnTarget.dependentTarget = this;
        }
    }

    getSelector(properties) {
        let cardCondition = (card, context) => {
            let abilities = card.actions.concat(card.triggeredAbilities).filter((ability) => ability.isActivatedAbility() && this.abilityCondition(ability));
            return abilities.some((ability) => {
                let contextCopy = context.copy();
                contextCopy.targetAbility = ability;
                if (context.stage === Stage.PreTarget && this.dependentCost && !this.dependentCost.canPay(contextCopy)) {
                    return false;
                }
                return (!properties.cardCondition || properties.cardCondition(card, contextCopy)) &&
                       (!this.dependentTarget || this.dependentTarget.hasLegalTarget(contextCopy)) &&
                       properties.immediateEffect.some((gameSystem) => gameSystem.hasLegalTarget(contextCopy));
            });
        };
        return CardSelector.for(Object.assign({}, properties, { cardCondition: cardCondition, targets: false }));
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

    getGameSystem(context) {
        return this.properties.immediateEffect.filter((gameSystem) => gameSystem.hasLegalTarget(context));
    }

    // TODO: add passHandler here so that player can potentially be prompted for pass earlier in the window
    resolve(context, targetResults) {
        if (targetResults.cancelled || targetResults.payCostsFirst || targetResults.delayTargeting) {
            return;
        }
        let player = context.choosingPlayerOverride || this.getChoosingPlayer(context);
        if (player === context.player.opponent && context.stage === Stage.PreTarget) {
            targetResults.delayTargeting = this;
            return;
        }
        let buttons = [];
        let waitingPromptTitle = '';
        if (context.stage === Stage.PreTarget) {
            buttons.push({ text: 'Cancel', arg: 'cancel' });
            if (context.ability.abilityType === 'action') {
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
                let abilities = card.actions.concat(card.triggeredAbilities).filter((ability) => ability.isActivatedAbility() && this.abilityCondition(ability));
                if (abilities.length === 1) {
                    context.targetAbility = abilities[0];
                } else if (abilities.length > 1) {
                    context.game.promptWithHandlerMenu(player, {
                        activePromptTitle: 'Choose an ability',
                        context: context,
                        choices: abilities.map((ability) => ability.title).concat('Back'),
                        choiceHandler: (choice) => {
                            if (choice === 'Back') {
                                context.game.queueSimpleStep(() => this.resolve(context, targetResults), `Resolve target '${this.name}' for ${context.ability}`);
                            } else {
                                context.targetAbility = abilities.find((ability) => ability.title === choice);
                            }
                        }
                    });
                }
                return true;
            },
            onCancel: () => {
                targetResults.cancelled = true;
                return true;
            },
            onMenuCommand: (player, arg) => {
                if (arg === 'costsFirst') {
                    targetResults.costsFirst = true;
                    return true;
                }
                return true;
            }
        };
        context.game.promptForSelect(player, Object.assign(promptProperties, this.properties));
    }

    checkTarget(context) {
        if (!context.targetAbility || context.choosingPlayerOverride && this.getChoosingPlayer(context) === context.player) {
            return false;
        }
        return context.targetAbility.card.hasSomeType(this.properties.cardType) &&
               (!this.properties.cardCondition || this.properties.cardCondition(context.targetAbility.card, context)) &&
               this.abilityCondition(context.targetAbility);
    }

    getChoosingPlayer(context) {
        let playerProp = this.properties.player;
        if (typeof playerProp === 'function') {
            playerProp = playerProp(context);
        }
        return playerProp === RelativePlayer.Opponent ? context.player.opponent : context.player;
    }

    hasTargetsChosenByInitiatingPlayer(context) {
        if (this.properties.immediateEffect.some((action) => action.hasTargetsChosenByInitiatingPlayer(context))) {
            return true;
        }
        return this.getChoosingPlayer(context) === context.player;
    }
}

module.exports = AbilityTargetAbility;
