import { MoveCardSystem } from '../gameSystems/MoveCardSystem';
import { EffectValueWrapper } from '../core/effect/effectImpl/EffectValueWrapper';
import { Location } from '../core/Constants';

const getApplyingPlayer = (effect) => {
    return effect.applyingPlayer || effect.context.player;
};

// const isMoveToHandAction = (gameAction) =>
//     gameAction instanceof MoveCardAction && gameAction.properties.destination === Location.Hand;

export const restrictionDsl = {
    // abilitiesTriggeredByOpponents: (context, effect) =>
    //     context.player === getApplyingPlayer(effect).opponent &&
    //     context.ability.isActivatedAbility() &&
    //     context.ability.abilityType !== AbilityTypes.ForcedReaction &&
    //     context.ability.abilityType !== AbilityTypes.ForcedInterrupt,
    // adjacentCharacters: (context, effect) =>
    //     context.source.type === CardTypes.Character &&
    //     context.player.areLocationsAdjacent(context.source.location, effect.context.source.location),
    // attachmentsWithSameClan: (context, effect, card) =>
    //     context.source.type === CardTypes.Attachment &&
    //     context.source.getPrintedFaction() !== 'neutral' &&
    //     card.isFaction(context.source.getPrintedFaction()),
    // attackedProvince: (context) =>
    //     context.game.currentConflict && context.game.currentConflict.getConflictProvinces().includes(context.source),
    // attackedProvinceNonForced: (context) =>
    //     context.game.currentConflict &&
    //     context.game.currentConflict.getConflictProvinces().includes(context.source) &&
    //     context.ability.isActivatedAbility() &&
    //     context.ability.abilityType !== AbilityTypes.ForcedReaction &&
    //     context.ability.abilityType !== AbilityTypes.ForcedInterrupt,
    // attackingCharacters: (context) =>
    //     context.game.currentConflict && context.source.type === CardTypes.Character && context.source.isAttacking(),
    // cardEffects: (context) =>
    //     (context.ability.isCardAbility() || !context.ability.isCardPlayed()) &&
    //     context.stage !== Stages.Cost &&
    //     [
    //         CardTypes.Event,
    //         CardTypes.Character,
    //         CardTypes.Holding,
    //         CardTypes.Attachment,
    //         CardTypes.Stronghold,
    //         CardTypes.Province,
    //         CardTypes.Role
    //     ].includes(context.source.type),
    // characters: (context) => context.source.type === CardTypes.Character,
    // charactersWithNoFate: (context) => context.source.type === CardTypes.Character && context.source.getFate() === 0,
    // copiesOfDiscardEvents: (context) =>
    //     context.source.type === CardTypes.Event &&
    //     context.player.conflictDiscardPile.any((card) => card.name === context.source.name),
    // copiesOfX: (context, effect) => context.source.name === effect.params,
    // events: (context) => context.source.type === CardTypes.Event,
    // eventsWithSameClan: (context, effect, card) =>
    //     context.source.type === CardTypes.Event &&
    //     context.source.getPrintedFaction() !== 'neutral' &&
    //     card.isFaction(context.source.getPrintedFaction()),
    // nonMonstrousEvents: (context) => context.source.type === CardTypes.Event && !context.source.hasTrait('monstrous'),
    // nonDynastyPhase: (context) => context.game.phase !== Phases.Dynasty,
    // nonSpellEvents: (context) => context.source.type === CardTypes.Event && !context.source.hasTrait('spell'),
    // opponentsAttachments: (context, effect) =>
    //     context.player &&
    //     context.player === getApplyingPlayer(effect).opponent &&
    //     context.source.type === CardTypes.Attachment,
    // opponentsCardEffects: (context, effect) =>
    //     context.player === getApplyingPlayer(effect).opponent &&
    //     (context.ability.isCardAbility() || !context.ability.isCardPlayed()) &&
    //     [
    //         CardTypes.Event,
    //         CardTypes.Character,
    //         CardTypes.Holding,
    //         CardTypes.Attachment,
    //         CardTypes.Stronghold,
    //         CardTypes.Province,
    //         CardTypes.Role
    //     ].includes(context.source.type),
    // opponentsProvinceEffects: (context, effect) =>
    //     context.player === getApplyingPlayer(effect).opponent &&
    //     (context.ability.isCardAbility() || !context.ability.isCardPlayed()) &&
    //     [CardTypes.Province].includes(context.source.type),
    // opponentsEvents: (context, effect) =>
    //     context.player &&
    //     context.player === getApplyingPlayer(effect).opponent &&
    //     context.source.type === CardTypes.Event,
    // opponentsTriggeredAbilities: (context, effect) =>
    //     context.player === getApplyingPlayer(effect).opponent && context.ability.isActivatedAbility(),
    // opponentsCardAbilities: (context, effect) =>
    //     context.player === getApplyingPlayer(effect).opponent && context.ability.isCardAbility(),
    // opponentsCharacters: (context, effect) =>
    //     context.source.type === CardTypes.Character && context.source.controller === getApplyingPlayer(effect).opponent,
    // opponentsCharacterAbilitiesWithLowerGlory: (context, effect) =>
    //     context.source.type === CardTypes.Character &&
    //     context.source.controller === getApplyingPlayer(effect).opponent &&
    //     context.source.glory < effect.context.source.parent.glory,
    // reactions: (context) => context.ability.abilityType === AbilityTypes.Reaction,
    // actionEvents: (context) =>
    //     context.ability.card.type === CardTypes.Event && context.ability.abilityType === AbilityTypes.Action,
    // source: (context, effect) => context.source === effect.context.source,
    // keywordAbilities: (context) => context.ability.isKeywordAbility(),
    // nonKeywordAbilities: (context) => !context.ability.isKeywordAbility(),
    // nonForcedAbilities: (context) =>
    //     context.ability.isActivatedAbility() &&
    //     context.ability.abilityType !== AbilityTypes.ForcedReaction &&
    //     context.ability.abilityType !== AbilityTypes.ForcedInterrupt,
    // equalOrMoreExpensiveCharacterTriggeredAbilities: (context, effect, card) =>
    //     context.source.type === CardTypes.Character &&
    //     !context.ability.isKeywordAbility &&
    //     context.source.printedCost >= card.printedCost,
    // equalOrMoreExpensiveCharacterKeywords: (context, effect, card) =>
    //     context.source.type === CardTypes.Character &&
    //     context.ability.isKeywordAbility &&
    //     context.source.printedCost >= card.printedCost,
    // eventPlayedByHigherBidPlayer: (context, effect, card) =>
    //     context.source.type === CardTypes.Event && context.player.showBid > card.controller.showBid,
    // toHand: (context) => {
    //     const targetActions = context.ability.properties.target ? context.ability.properties.target.gameAction : [];
    //     const nestedActions = context.ability.gameAction
    //         ? context.ability.gameAction.map((topAction) => topAction.properties.gameAction)
    //         : [];

    //     return targetActions.some(isMoveToHandAction) || nestedActions.some(isMoveToHandAction);
    // },
    // loseHonorAsCost: (context) => context.stage === Stages.Cost,
};
