const Helpers = require('../../utils/Helpers.js');
const CardSelector = require('../../cardSelector/CardSelector.js');
const { Stage, RelativePlayer, EffectName, TargetMode } = require('../../Constants.js');
const Contract = require('../../utils/Contract.js');
const EnumHelpers = require('../../utils/EnumHelpers.js');
const { GameSystem } = require('../../gameSystem/GameSystem.js');

// TODO: the TargetResolver classes need a base class and then converted to TS
/**
 * Target resolver for selecting cards for the target of an effect.
 * @param {GameSystem} [properties.immediateEffect] - Optional GameSystem for effect(s)
 */
class CardTargetResolver {
    constructor(name, properties, ability) {
        this.name = name;
        this.properties = properties;
        if (this.properties.immediateEffect) {
            this.properties.immediateEffect.setDefaultTargetFn((context) => context.targets[name]);
        }
        this.selector = this.getSelector(properties);
        this.dependentTarget = null;
        this.dependentCost = null;
        if (this.properties.dependsOn) {
            let dependsOnTarget = ability.targetResolvers.find((target) => target.name === this.properties.dependsOn);

            // assert that the target we depend on actually exists
            Contract.assertNotNullLike(dependsOnTarget);

            dependsOnTarget.dependentTarget = this;
        }

        this.validateLocationLegalForTarget(properties);
    }

    getSelector(properties) {
        let cardCondition = (card, context) => {
            let contextCopy = this.getContextCopy(card, context);
            if (context.stage === Stage.PreTarget && this.dependentCost && !this.dependentCost.canPay(contextCopy)) {
                return false;
            }
            return (!this.dependentTarget || this.dependentTarget.hasLegalTarget(contextCopy)) &&
                   (properties.immediateEffect == null || properties.immediateEffect.hasLegalTarget(contextCopy) &&
                   (!properties.cardCondition || properties.cardCondition(card, contextCopy)));
        };
        return CardSelector.for(Object.assign({}, properties, { cardCondition: cardCondition, targets: true }));
    }

    getContextCopy(card, context) {
        let contextCopy = context.copy();
        contextCopy.targets[this.name] = card;
        if (this.name === 'target') {
            contextCopy.target = card;
        }
        return contextCopy;
    }

    canResolve(context) {
        // if this depends on another target, that will check hasLegalTarget already
        return !!this.properties.dependsOn || this.hasLegalTarget(context);
    }

    hasLegalTarget(context) {
        return this.selector.optional || this.selector.hasEnoughTargets(context, this.getChoosingPlayer(context));
    }

    /** @returns {GameSystem[]} */
    getGameSystems() {
        return this.properties.immediateEffect ? [this.properties.immediateEffect] : [];
    }

    getAllLegalTargets(context) {
        return this.selector.getAllLegalTargets(context, this.getChoosingPlayer(context));
    }

    resolve(context, targetResults, passPrompt = null) {
        if (targetResults.cancelled || targetResults.payCostsFirst || targetResults.delayTargeting) {
            return;
        }
        let player = context.choosingPlayerOverride || this.getChoosingPlayer(context);
        if (player === context.player.opponent && context.stage === Stage.PreTarget) {
            targetResults.delayTargeting = this;
            return;
        }

        const legalTargets = this.selector.getAllLegalTargets(context, player);
        if (legalTargets.length === 0) {
            if (context.stage === Stage.PreTarget) {
                // if there are no targets at the pretarget stage, delay targeting until after costs are paid
                targetResults.delayTargeting = this;
                return;
            }
            return;
        }

        if (context.player.autoSingleTarget && legalTargets.length === 1) {
            context.targets[this.name] = legalTargets[0];
            if (this.name === 'target') {
                context.target = legalTargets[0];
            }
            return;
        }

        // create a copy of properties without cardCondition or player
        let extractedProperties;
        {
            let { cardCondition, player, ...otherProperties } = this.properties;
            extractedProperties = otherProperties;
        }

        let buttons = [];
        let waitingPromptTitle = '';
        if (context.stage === Stage.PreTarget) {
            if (!targetResults.noCostsFirstButton) {
                buttons.push({ text: 'Pay costs first', arg: 'costsFirst' });
            }
            buttons.push({ text: 'Cancel', arg: 'cancel' });
            if (passPrompt) {
                buttons.push({ text: passPrompt.buttonText, arg: passPrompt.arg });
                passPrompt.hasBeenShown = true;
            }
            if (this.selector.optional) {
                buttons.push({ text: 'Choose no target', arg: 'noTarget' });
            }
            if (context.ability.type === 'action') {
                waitingPromptTitle = 'Waiting for opponent to take an action or pass';
            } else {
                waitingPromptTitle = 'Waiting for opponent';
            }
        }
        let mustSelect = legalTargets.filter((card) =>
            card.getOngoingEffectValues(EffectName.MustBeChosen).some((restriction) => restriction.isMatch('target', context))
        );
        let promptProperties = {
            waitingPromptTitle: waitingPromptTitle,
            context: context,
            selector: this.selector,
            buttons: buttons,
            mustSelect: mustSelect,
            onSelect: (player, card) => {
                context.targets[this.name] = card;
                if (this.name === 'target') {
                    context.target = card;
                }
                return true;
            },
            onCancel: () => {
                this.cancel(targetResults);
                return true;
            },
            onMenuCommand: (player, arg) => {
                switch (arg) {
                    case 'costsFirst':
                        targetResults.payCostsFirst = true;
                        return true;

                    case passPrompt?.arg:
                        this.cancel(targetResults);
                        passPrompt.handler();
                        return true;

                    case 'cancel':
                    case 'noTarget':
                        return true;

                    default:
                        Contract.fail(`Unknown menu option '${arg}'`);
                }
            }
        };
        context.game.promptForSelect(player, Object.assign(promptProperties, extractedProperties));
    }

    cancel(targetResults) {
        targetResults.cancelled = true;
    }

    checkTarget(context) {
        if (!context.targets[this.name]) {
            return false;
        } else if (context.choosingPlayerOverride && this.getChoosingPlayer(context) === context.player) {
            return false;
        }
        let cards = context.targets[this.name];
        if (!Array.isArray(cards)) {
            cards = [cards];
        }
        return (cards.every((card) => this.selector.canTarget(card, context, context.choosingPlayerOverride || this.getChoosingPlayer(context))) &&
                this.selector.hasEnoughSelected(cards, context) && !this.selector.hasExceededLimit(cards, context));
    }

    getChoosingPlayer(context) {
        let playerProp = this.properties.choosingPlayer;
        if (typeof playerProp === 'function') {
            playerProp = playerProp(context);
        }
        return playerProp === RelativePlayer.Opponent ? context.player.opponent : context.player;
    }

    hasTargetsChosenByInitiatingPlayer(context) {
        if (this.getChoosingPlayer(context) === context.player && (this.selector.optional || this.selector.hasEnoughTargets(context, context.player.opponent))) {
            return true;
        }
        return !this.properties.dependsOn && this.checkGameActionsForTargetsChosenByInitiatingPlayer(context);
    }

    checkGameActionsForTargetsChosenByInitiatingPlayer(context) {
        return this.getAllLegalTargets(context).some((card) => {
            let contextCopy = this.getContextCopy(card, context);
            if (this.properties.immediateEffect && this.properties.immediateEffect.hasTargetsChosenByInitiatingPlayer(contextCopy)) {
                return true;
            } else if (this.dependentTarget) {
                return this.dependentTarget.checkGameActionsForTargetsChosenByInitiatingPlayer(contextCopy);
            }
            return false;
        });
    }

    /**
     * Checks whether the target's provided location filters have at least one legal location for the provided
     * card types. This is to catch situations in which a mismatched location and card type was accidentally
     * provided, which would cause target resolution to always silently fail to find any legal targets.
     */
    validateLocationLegalForTarget(properties) {
        if (!properties.locationFilter || !properties.cardTypeFilter) {
            return;
        }

        for (const type of Array.isArray(properties.cardTypeFilter) ? properties.cardTypeFilter : [properties.cardTypeFilter]) {
            const legalLocations = Helpers.defaultLegalLocationsForCardTypeFilter(type);
            if (legalLocations.some((location) => EnumHelpers.cardLocationMatches(location, properties.locationFilter))) {
                return;
            }
        }

        Contract.fail(`Target location filters '${properties.locationFilter}' for ability has no overlap with legal locations for target card types '${properties.cardTypeFilter}', so target resolution is guaranteed to find no legal targets`);
    }
}

module.exports = CardTargetResolver;
