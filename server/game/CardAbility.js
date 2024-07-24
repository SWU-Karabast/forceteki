const AbilityLimit = require('./AbilityLimit');
const AbilityDsl = require('./abilitydsl');
const ThenAbility = require('./ThenAbility');
const Costs = require('./costs/Costs.js');
const { Locations, CardTypes, EffectNames, WildcardLocations } = require('./Constants');

class CardAbility extends ThenAbility {
    constructor(game, card, properties) {
        super(game, card, properties);

        this.title = properties.title;
        this.limit = properties.limit || AbilityLimit.perRound(1);
        this.limit.registerEvents(game);
        this.limit.ability = this;
        this.abilityCost = this.cost;
        this.location = this.buildLocation(card, properties.location);
        this.printedAbility = properties.printedAbility === false ? false : true;
        this.cannotBeCancelled = properties.cannotBeCancelled;
        this.cannotTargetFirst = !!properties.cannotTargetFirst;
        this.cannotBeMirrored = !!properties.cannotBeMirrored;
        this.max = properties.max;
        this.abilityIdentifier = properties.abilityIdentifier;
        this.origin = properties.origin;
        if (!this.abilityIdentifier) {
            this.abilityIdentifier = this.printedAbility ? this.card.id + '1' : '';
        }
        this.maxIdentifier = this.card.name + this.abilityIdentifier;

        if (this.max) {
            this.card.owner.registerAbilityMax(this.maxIdentifier, this.max);
        }

        if (card.getType() === CardTypes.Event && !this.isKeywordAbility()) {
            this.cost = this.cost.concat(Costs.payReduceableResourceCost());
        }
    }

    buildLocation(card, location) {
        const DefaultLocationForType = {
            event: Locations.Hand,
            leader: Locations.Leader,
            base: Locations.Base,
        };

        // TODO: make this not have to be an array (was this way for provinces)
        let defaultedLocation = [location || DefaultLocationForType[card.getType()] || WildcardLocations.AnyArena];

        return defaultedLocation;
    }

    meetsRequirements(context, ignoredRequirements = []) {
        if (this.card.isBlank() && this.printedAbility) {
            return 'blank';
        }

        if (
            (this.isTriggeredAbility() && !this.card.canTriggerAbilities(context, ignoredRequirements)) ||
            (this.card.type === CardTypes.Event && !this.card.canPlay(context, context.playType))
        ) {
            return 'cannotTrigger';
        }

        if (this.isKeywordAbility() && !this.card.canInitiateKeywords(context)) {
            return 'cannotInitiate';
        }

        if (!ignoredRequirements.includes('limit') && this.limit.isAtMax(context.player)) {
            return 'limit';
        }

        if (!ignoredRequirements.includes('max') && this.max && context.player.isAbilityAtMax(this.maxIdentifier)) {
            return 'max';
        }

        if (this.isCardPlayed() && this.card.isLimited() && context.player.limitedPlayed >= context.player.maxLimited) {
            return 'limited';
        }

        if (
            !ignoredRequirements.includes('phase') &&
            !this.isKeywordAbility() &&
            this.card.isDynasty &&
            this.card.type === CardTypes.Event &&
            context.game.currentPhase !== 'dynasty'
        ) {
            return 'phase';
        }

        return super.meetsRequirements(context, ignoredRequirements);
    }

    getCosts(context, playCosts = true, triggerCosts = true) {
        let costs = super.getCosts(context, playCosts);
        if (!context.subResolution && triggerCosts && context.player.anyEffect(EffectNames.AdditionalTriggerCost)) {
            const additionalTriggerCosts = context.player
                .getEffects(EffectNames.AdditionalTriggerCost)
                .map((effect) => effect(context));
            costs = costs.concat(...additionalTriggerCosts);
        }
        if (!context.subResolution && triggerCosts && context.source.anyEffect(EffectNames.AdditionalTriggerCost)) {
            const additionalTriggerCosts = context.source
                .getEffects(EffectNames.AdditionalTriggerCost)
                .map((effect) => effect(context));
            costs = costs.concat(...additionalTriggerCosts);
        }
        if (!context.subResolution && playCosts && context.player.anyEffect(EffectNames.AdditionalPlayCost)) {
            const additionalPlayCosts = context.player
                .getEffects(EffectNames.AdditionalPlayCost)
                .map((effect) => effect(context));
            return costs.concat(...additionalPlayCosts);
        }
        return costs;
    }

    getReducedCost(context) {
        let fateCost = this.cost.find((cost) => cost.getReducedCost);
        return fateCost ? fateCost.getReducedCost(context) : 0;
    }

    isInValidLocation(context) {
        return this.card.type === CardTypes.Event
            ? context.player.isCardInPlayableLocation(context.source, context.playType)
            : this.location.includes(this.card.location);
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

    displayMessage(context, messageVerb = context.source.type === CardTypes.Event ? 'plays' : 'uses') {
        if (
            context.source.type === CardTypes.Event &&
            context.source.isConflict &&
            context.source.location !== Locations.Hand &&
            context.source.location !== Locations.BeingPlayed
        ) {
            this.game.addMessage(
                '{0} plays {1} from {2} {3}',
                context.player,
                context.source,
                context.source.controller === context.player ? 'their' : "their opponent's",
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
        let gainedAbility = origin ? "'s gained ability from " : '';
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
            let gameActions = this.getGameActions(context).filter((gameAction) => gameAction.hasLegalTarget(context));
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

    isCardPlayed() {
        return !this.isKeywordAbility() && this.card.getType() === CardTypes.Event;
    }

    isTriggeredAbility() {
        return true;
    }
}

module.exports = CardAbility;
