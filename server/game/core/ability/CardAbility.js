const AbilityLimit = require('./AbilityLimit.js');
const CardAbilityStep = require('./CardAbilityStep.js');
const Costs = require('../../costs/CostLibrary.js');
const { Location, CardType, EffectName, WildcardLocation, AbilityType, PhaseName } = require('../Constants.js');
const EnumHelpers = require('../utils/EnumHelpers.js');
const Contract = require('../utils/Contract.js');

class CardAbility extends CardAbilityStep {
    constructor(game, card, properties, type = AbilityType.Action) {
        super(game, card, properties, type);

        this.title = properties.title;

        this.limit = properties.limit || AbilityLimit.unlimited();
        this.limit.registerEvents(game);
        this.limit.ability = this;
        this.abilityCost = this.cost;
        this.printedAbility = properties.printedAbility === false ? false : true;
        this.locationFilter = this.locationOrDefault(card, properties.locationFilter);
        this.cannotBeCancelled = properties.cannotBeCancelled;
        this.cannotTargetFirst = !!properties.cannotTargetFirst;
        this.cannotBeMirrored = !!properties.cannotBeMirrored;
        this.gainAbilitySource = properties.gainAbilitySource;

        // if an ability name wasn't provided, assume this ability was created for some one-off purpose and not attached to the card
        this.abilityIdentifier = properties.abilityIdentifier || `${this.card.internalName}_anonymous`;
    }

    locationOrDefault(card, location) {
        if (location != null) {
            return location;
        }

        if (card.isEvent()) {
            return Location.Hand;
        }
        if (card.isLeader()) {
            // check that this is a gained ability - if it's a printed leader ability, it should have an explicit locationFilter based on which side of the card it's on
            Contract.assertFalse(this.printedAbility, 'Leader card abilities must explicitly assign properties.locationFilter for the correct active zone of the ability');

            return WildcardLocation.AnyArena;
        }
        if (card.isBase()) {
            return Location.Base;
        }
        if (card.isUnit() || card.isUpgrade()) {
            return WildcardLocation.AnyArena;
        }

        Contract.fail(`Unknown card type for card: ${card.internalName}`);
        return null;
    }

    /** @override */
    meetsRequirements(context, ignoredRequirements = []) {
        if (this.card.isBlank() && this.printedAbility) {
            return 'blank';
        }

        if (
            (this.isActivatedAbility() && !this.card.canTriggerAbilities(context, ignoredRequirements)) ||
            (this.card.isEvent() && !this.card.canPlay(context, context.playType))
        ) {
            return 'cannotTrigger';
        }

        if (this.isKeywordAbility() && !this.card.canInitiateKeywords(context)) {
            return 'cannotInitiate';
        }

        if (!ignoredRequirements.includes('limit') && this.limit.isAtMax(context.player)) {
            return 'limit';
        }

        // TODO: enum for ignoredRequirements strings?
        // TODO: is this phase ability check correct for SWU? not sure about constant abilities during regroup phase
        if (
            !ignoredRequirements.includes('phase') &&
            !this.isKeywordAbility() &&
            context.game.currentPhase !== PhaseName.Action
        ) {
            return 'phase';
        }

        return super.meetsRequirements(context, ignoredRequirements);
    }

    /** @override */
    getCosts(context, playCosts = true, triggerCosts = true) {
        let costs = super.getCosts(context, playCosts);
        if (!context.subResolution && triggerCosts && context.player.hasOngoingEffect(EffectName.AdditionalTriggerCost)) {
            const additionalTriggerCosts = context.player
                .getOngoingEffectValues(EffectName.AdditionalTriggerCost)
                .map((effect) => effect(context));
            costs = costs.concat(...additionalTriggerCosts);
        }
        if (!context.subResolution && triggerCosts && context.source.hasOngoingEffect(EffectName.AdditionalTriggerCost)) {
            const additionalTriggerCosts = context.source
                .getOngoingEffectValues(EffectName.AdditionalTriggerCost)
                .map((effect) => effect(context));
            costs = costs.concat(...additionalTriggerCosts);
        }
        if (!context.subResolution && playCosts && context.player.hasOngoingEffect(EffectName.AdditionalPlayCost)) {
            const additionalPlayCosts = context.player
                .getOngoingEffectValues(EffectName.AdditionalPlayCost)
                .map((effect) => effect(context));
            return costs.concat(...additionalPlayCosts);
        }
        return costs;
    }

    getAdjustedCost(context) {
        let resourceCost = this.cost.find((cost) => cost.getAdjustedCost);
        return resourceCost ? resourceCost.getAdjustedCost(context) : 0;
    }

    isInValidLocation(context) {
        return this.card.isEvent()
            ? context.player.isCardInPlayableLocation(context.source, context.playType)
            : EnumHelpers.cardLocationMatches(this.card.location, this.locationFilter);
    }

    getLocationMessage(location, context) {
        if (location.matchTarget(/^\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b$/i)) {
            // it's a uuid
            let source = context.game.findAnyCardInPlayByUuid(location);
            if (source) {
                return `cards set aside by ${source.name}`;
            }
            return 'out of play area';
        }
        return location;
    }

    /** @override */
    displayMessage(context, messageVerb = context.source.isEvent() ? 'plays' : 'uses') {
        if (
            context.source.isEvent() &&
            context.source.location !== Location.Discard
        ) {
            this.game.addMessage(
                '{0} plays {1} from {2} {3}',
                context.player,
                context.source,
                context.source.controller === context.player ? 'their' : 'their opponent\'s',
                this.getLocationMessage(context.source.location, context)
            );
        }

        if (this.properties.message) {
            let messageArgs = this.properties.messageArgs;
            if (typeof messageArgs === 'function') {
                messageArgs = messageArgs(context);
            }
            if (!Array.isArray(messageArgs)) {
                messageArgs = [messageArgs];
            }
            this.game.addMessage(this.properties.message, ...messageArgs);
            return;
        }

        let gainAbilitySource = context.ability && context.ability.gainAbilitySource;

        let gainedAbility = gainAbilitySource ? '\'s gained ability from ' : '';
        let messageArgs = [context.player, ' ' + messageVerb + ' ', context.source, gainedAbility, gainAbilitySource];
        let costMessages = this.cost
            .map((cost) => {
                if (cost.getCostMessage && cost.getCostMessage(context)) {
                    let card = context.costs[cost.getActionName(context)];
                    if (card && card.isFacedown && card.isFacedown()) {
                        card = 'a facedown card';
                    }
                    let [format, args] = ['ERROR - MISSING COST MESSAGE', [' ', ' ']];
                    [format, args] = cost.getCostMessage(context);
                    return { message: this.game.gameChat.formatMessage(format, [card].concat(args)) };
                }
                return null;
            })
            .filter((obj) => obj);

        if (costMessages.length > 0) {
            // ,
            messageArgs.push(', ');
            // paying 3 honor
            messageArgs.push(costMessages);
        } else {
            messageArgs = messageArgs.concat(['', '']);
        }

        let effectMessage = this.properties.effect;
        let effectArgs = [];
        let extraArgs = null;
        if (!effectMessage) {
            let gameActions = this.getGameSystems(context).filter((gameSystem) => gameSystem.hasLegalTarget(context));
            if (gameActions.length > 0) {
                // effects with multiple game actions really need their own effect message
                [effectMessage, extraArgs] = gameActions[0].getEffectMessage(context);
            }
        } else {
            effectArgs.push(context.target || context.ring || context.source);
            extraArgs = this.properties.effectArgs;
        }

        if (extraArgs) {
            if (typeof extraArgs === 'function') {
                extraArgs = extraArgs(context);
            }
            effectArgs = effectArgs.concat(extraArgs);
        }

        if (effectMessage) {
            // to
            messageArgs.push(' to ');
            // discard Stoic Gunso
            messageArgs.push({ message: this.game.gameChat.formatMessage(effectMessage, effectArgs) });
        }
        this.game.addMessage('{0}{1}{2}{3}{4}{5}{6}{7}{8}', ...messageArgs);
    }

    /** @override */
    isActivatedAbility() {
        return [AbilityType.Action, AbilityType.Event, AbilityType.Triggered].includes(this.type);
    }
}

module.exports = CardAbility;
