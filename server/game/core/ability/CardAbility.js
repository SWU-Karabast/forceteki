const AbilityLimit = require('./AbilityLimit.js');
const CardAbilityStep = require('./CardAbilityStep.js');
const Costs = require('../../costs/CostLibrary.js');
const { Location, CardType, EffectName, WildcardLocation, AbilityType, PhaseName } = require('../Constants.js');
const { cardLocationMatches } = require('../utils/EnumHelpers.js');
const { addInitiateAttackProperties } = require('../attack/AttackHelper.js');

class CardAbility extends CardAbilityStep {
    constructor(game, card, properties, abilityType = AbilityType.Action) {
        if (properties.initiateAttack) {
            addInitiateAttackProperties(properties);
        }
        super(game, card, properties, abilityType);

        this.title = properties.title;

        this.limit = properties.limit || AbilityLimit.unlimited();
        this.limit.registerEvents(game);
        this.limit.ability = this;
        this.abilityCost = this.cost;
        this.location = this.buildLocation(card, properties.location);
        this.printedAbility = properties.printedAbility === false ? false : true;
        this.cannotBeCancelled = properties.cannotBeCancelled;
        this.cannotTargetFirst = !!properties.cannotTargetFirst;
        this.cannotBeMirrored = !!properties.cannotBeMirrored;
        this.optional = !!properties.optional;
        this.abilityIdentifier = properties.abilityIdentifier;
        this.origin = properties.origin;
        if (!this.abilityIdentifier) {
            this.abilityIdentifier = this.printedAbility ? this.card.id + '1' : '';
        }

        // TODO EVENT: this is where the actual payment and activation of an event card happens, this needs to be
        // changed to behave more like a unit card in terms of how it's played
        if (card.isEvent() && !this.isKeywordAbility()) {
            this.cost = this.cost.concat(Costs.payAdjustableResourceCost());
        }
    }

    buildLocation(card, location) {
        let defaultLocationForType = null;
        if (card.isEvent()) {
            defaultLocationForType = Location.Hand;
        } else if (card.isLeader()) {
            defaultLocationForType = Location.Leader;
        } else if (card.isBase()) {
            defaultLocationForType = Location.Base;
        } else {
            defaultLocationForType = WildcardLocation.AnyArena;
        }

        let defaultedLocation = [location || defaultLocationForType];

        return defaultedLocation;
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
        if (!context.subResolution && triggerCosts && context.player.anyEffect(EffectName.AdditionalTriggerCost)) {
            const additionalTriggerCosts = context.player
                .getEffectValues(EffectName.AdditionalTriggerCost)
                .map((effect) => effect(context));
            costs = costs.concat(...additionalTriggerCosts);
        }
        if (!context.subResolution && triggerCosts && context.source.anyEffect(EffectName.AdditionalTriggerCost)) {
            const additionalTriggerCosts = context.source
                .getEffectValues(EffectName.AdditionalTriggerCost)
                .map((effect) => effect(context));
            costs = costs.concat(...additionalTriggerCosts);
        }
        if (!context.subResolution && playCosts && context.player.anyEffect(EffectName.AdditionalPlayCost)) {
            const additionalPlayCosts = context.player
                .getEffectValues(EffectName.AdditionalPlayCost)
                .map((effect) => effect(context));
            return costs.concat(...additionalPlayCosts);
        }
        return costs;
    }

    getReducedCost(context) {
        let resourceCost = this.cost.find((cost) => cost.getReducedCost);
        return resourceCost ? resourceCost.getReducedCost(context) : 0;
    }

    isInValidLocation(context) {
        return this.card.isEvent()
            ? context.player.isCardInPlayableLocation(context.source, context.playType)
            : cardLocationMatches(this.card.location, this.location);
    }

    getLocationMessage(location, context) {
        if (location.match(/^\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b$/i)) {
            //it's a uuid
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
            context.source.isConflict &&
            context.source.location !== Location.Hand &&
            context.source.location !== Location.BeingPlayed
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

        let origin = context.ability && context.ability.origin;
        // if origin is the same as source then ignore it
        if (origin === context.source) {
            origin = null;
        }

        // Player1 plays Assassination
        let gainedAbility = origin ? '\'s gained ability from ' : '';
        let messageArgs = [context.player, ' ' + messageVerb + ' ', context.source, gainedAbility, origin];
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
        return [AbilityType.Action, AbilityType.TriggeredAbility].includes(this.abilityType);
    }

    /** @override */
    isCardPlayed() {
        return !this.isKeywordAbility() && this.card.isEvent();
    }
}

module.exports = CardAbility;
