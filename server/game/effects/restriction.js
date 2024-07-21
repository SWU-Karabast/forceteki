const { EffectValue } = require('./EffectValue');

const { AbilityTypes, CardTypes, Locations, Phases, Stages } = require('../Constants');
const { MoveCardAction } = require('../GameActions/MoveCardAction');

const checkRestrictions = {
    abilitiesTriggeredByOpponents: (context, effect) =>
        context.player === getApplyingPlayer(effect).opponent &&
        context.ability.isTriggeredAbility() &&
        context.ability.abilityType !== AbilityTypes.ForcedReaction &&
        context.ability.abilityType !== AbilityTypes.ForcedInterrupt,
    adjacentCharacters: (context, effect) =>
        context.source.type === CardTypes.Character &&
        context.player.areLocationsAdjacent(context.source.location, effect.context.source.location),
    attachmentsWithSameClan: (context, effect, card) =>
        context.source.type === CardTypes.Attachment &&
        context.source.getPrintedFaction() !== 'neutral' &&
        card.isFaction(context.source.getPrintedFaction()),
    attackedProvince: (context) =>
        context.game.currentConflict && context.game.currentConflict.getConflictProvinces().includes(context.source),
    attackedProvinceNonForced: (context) =>
        context.game.currentConflict &&
        context.game.currentConflict.getConflictProvinces().includes(context.source) &&
        context.ability.isTriggeredAbility() &&
        context.ability.abilityType !== AbilityTypes.ForcedReaction &&
        context.ability.abilityType !== AbilityTypes.ForcedInterrupt,
    attackingCharacters: (context) =>
        context.game.currentConflict && context.source.type === CardTypes.Character && context.source.isAttacking(),
    cardEffects: (context) =>
        (context.ability.isCardAbility() || !context.ability.isCardPlayed()) &&
        context.stage !== Stages.Cost &&
        [
            CardTypes.Event,
            CardTypes.Character,
            CardTypes.Holding,
            CardTypes.Attachment,
            CardTypes.Stronghold,
            CardTypes.Province,
            CardTypes.Role
        ].includes(context.source.type),
    ringEffects: (context) => context.source.type === 'ring',
    cardAndRingEffects: (context) => checkRestrictions.cardEffects(context) || checkRestrictions.ringEffects(context),
    characters: (context) => context.source.type === CardTypes.Character,
    charactersWithNoFate: (context) => context.source.type === CardTypes.Character && context.source.getFate() === 0,
    copiesOfDiscardEvents: (context) =>
        context.source.type === CardTypes.Event &&
        context.player.conflictDiscardPile.any((card) => card.name === context.source.name),
    copiesOfX: (context, effect) => context.source.name === effect.params,
    events: (context) => context.source.type === CardTypes.Event,
    eventsWithSameClan: (context, effect, card) =>
        context.source.type === CardTypes.Event &&
        context.source.getPrintedFaction() !== 'neutral' &&
        card.isFaction(context.source.getPrintedFaction()),
    nonMonstrousEvents: (context) => context.source.type === CardTypes.Event && !context.source.hasTrait('monstrous'),
    nonDynastyPhase: (context) => context.game.phase !== Phases.Dynasty,
    nonSpellEvents: (context) => context.source.type === CardTypes.Event && !context.source.hasTrait('spell'),
    opponentsAttachments: (context, effect) =>
        context.player &&
        context.player === getApplyingPlayer(effect).opponent &&
        context.source.type === CardTypes.Attachment,
    opponentsCardEffects: (context, effect) =>
        context.player === getApplyingPlayer(effect).opponent &&
        (context.ability.isCardAbility() || !context.ability.isCardPlayed()) &&
        [
            CardTypes.Event,
            CardTypes.Character,
            CardTypes.Holding,
            CardTypes.Attachment,
            CardTypes.Stronghold,
            CardTypes.Province,
            CardTypes.Role
        ].includes(context.source.type),
    opponentsProvinceEffects: (context, effect) =>
        context.player === getApplyingPlayer(effect).opponent &&
        (context.ability.isCardAbility() || !context.ability.isCardPlayed()) &&
        [CardTypes.Province].includes(context.source.type),
    opponentsEvents: (context, effect) =>
        context.player &&
        context.player === getApplyingPlayer(effect).opponent &&
        context.source.type === CardTypes.Event,
    opponentsRingEffects: (context, effect) =>
        context.player && context.player === getApplyingPlayer(effect).opponent && context.source.type === 'ring',
    opponentsCardAndRingEffects: (context, effect) =>
        checkRestrictions.opponentsCardEffects(context, effect) ||
        checkRestrictions.opponentsRingEffects(context, effect),
    opponentsTriggeredAbilities: (context, effect) =>
        context.player === getApplyingPlayer(effect).opponent && context.ability.isTriggeredAbility(),
    opponentsCardAbilities: (context, effect) =>
        context.player === getApplyingPlayer(effect).opponent && context.ability.isCardAbility(),
    opponentsCharacters: (context, effect) =>
        context.source.type === CardTypes.Character && context.source.controller === getApplyingPlayer(effect).opponent,
    opponentsCharacterAbilitiesWithLowerGlory: (context, effect) =>
        context.source.type === CardTypes.Character &&
        context.source.controller === getApplyingPlayer(effect).opponent &&
        context.source.glory < effect.context.source.parent.glory,
    provinces: (context) => context.source.type === CardTypes.Province,
    reactions: (context) => context.ability.abilityType === AbilityTypes.Reaction,
    actionEvents: (context) =>
        context.ability.card.type === CardTypes.Event && context.ability.abilityType === AbilityTypes.Action,
    source: (context, effect) => context.source === effect.context.source,
    keywordAbilities: (context) => context.ability.isKeywordAbility(),
    nonKeywordAbilities: (context) => !context.ability.isKeywordAbility(),
    nonForcedAbilities: (context) =>
        context.ability.isTriggeredAbility() &&
        context.ability.abilityType !== AbilityTypes.ForcedReaction &&
        context.ability.abilityType !== AbilityTypes.ForcedInterrupt,
    equalOrMoreExpensiveCharacterTriggeredAbilities: (context, effect, card) =>
        context.source.type === CardTypes.Character &&
        !context.ability.isKeywordAbility &&
        context.source.printedCost >= card.printedCost,
    equalOrMoreExpensiveCharacterKeywords: (context, effect, card) =>
        context.source.type === CardTypes.Character &&
        context.ability.isKeywordAbility &&
        context.source.printedCost >= card.printedCost,
    eventPlayedByHigherBidPlayer: (context, effect, card) =>
        context.source.type === CardTypes.Event && context.player.showBid > card.controller.showBid,
    toHand: (context) => {
        let targetActions = context.ability.properties.target ? context.ability.properties.target.gameAction : [];
        let nestedActions = context.ability.gameAction
            ? context.ability.gameAction.map((topAction) => topAction.properties.gameAction)
            : [];

        return targetActions.some(isMoveToHandAction) || nestedActions.some(isMoveToHandAction);
    },
    loseHonorAsCost: (context) => context.stage === Stages.Cost,
    unlessMeishodo: (context) => {
        const spell = context.source || context;
        return !spell.hasTrait('meishodo');
    }
};

const getApplyingPlayer = (effect) => {
    return effect.applyingPlayer || effect.context.player;
};

const isMoveToHandAction = (gameAction) =>
    // @ts-ignorea
    gameAction instanceof MoveCardAction && gameAction.properties.destination === Locations.Hand;

const leavePlayTypes = new Set(['discardFromPlay', 'sacrifice', 'returnToHand', 'returnToDeck', 'removeFromGame']);

class Restriction extends EffectValue {
    constructor(properties) {
        super();
        if (typeof properties === 'string') {
            this.type = properties;
        } else {
            this.type = properties.type;
            this.restriction = properties.restricts;
            this.applyingPlayer = properties.applyingPlayer;
            this.params = properties.params;
        }
    }

    // @ts-ignore
    getValue() {
        return this;
    }

    isMatch(type, context, card) {
        if (this.type === 'leavePlay') {
            return leavePlayTypes.has(type) && this.checkCondition(context, card);
        }

        return (!this.type || this.type === type) && this.checkCondition(context, card);
    }

    checkCondition(context, card) {
        if (Array.isArray(this.restriction)) {
            const vals = this.restriction.map((a) => this.checkRestriction(a, context, card));
            return vals.every((a) => a);
        }

        return this.checkRestriction(this.restriction, context, card);
    }

    checkRestriction(restriction, context, card) {
        if (!restriction) {
            return true;
        } else if (!context) {
            throw new Error('checkCondition called without a context');
        } else if (typeof restriction === 'function') {
            return restriction(context, this, card);
        } else if (!checkRestrictions[restriction]) {
            return context.source.hasTrait(restriction);
        }
        return checkRestrictions[restriction](context, this, card);
    }
}

module.exports = Restriction;