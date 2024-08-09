const _ = require('underscore');

const AbilityLimit = require('../core/ability/AbilityLimit.js');
// const GainAllAbiliitesDynamic = require('./Effects/GainAllAbilitiesDynamic.js');
// const Restriction = require('./Effects/restriction.js');
// const { SuppressEffect } = require('./Effects/SuppressEffect');
const { EffectBuilder } = require('../core/effect/EffectBuilder.js');
// const { attachmentMilitarySkillModifier } = require('./Effects/Library/attachmentMilitarySkillModifier');
// const { attachmentPoliticalSkillModifier } = require('./Effects/Library/attachmentPoliticalSkillModifier');
// const { canPlayFromOwn } = require('./Effects/Library/canPlayFromOwn');
const { cardCannot } = require('./CardCannot');
// const { copyCard } = require('./Effects/Library/copyCard');
// const { gainAllAbilities } = require('./Effects/Library/GainAllAbilities');
// const { gainAbility } = require('./Effects/Library/gainAbility');
// const { mustBeDeclaredAsAttacker } = require('./Effects/Library/mustBeDeclaredAsAttacker');
const { modifyCost } = require('./ModifyCost.js');
// const { switchAttachmentSkillModifiers } = require('./Effects/Library/switchAttachmentSkillModifiers');
const { EffectName, PlayType, CardType, RelativePlayer } = require('../core/Constants.js');

/* Types of effect
    1. Static effects - do something for a period
    2. Dynamic effects - like static, but what they do depends on the game state
    3. Detached effects - do something when applied, and on expiration, but can be ignored in the interim
*/

const Effects = {
    // Card effects
    // addFaction: (faction) => EffectBuilder.card.static(EffectName.AddFaction, faction),
    addKeyword: (keyword) => EffectBuilder.card.static(EffectName.AddKeyword, keyword),
    // addTrait: (trait) => EffectBuilder.card.static(EffectName.AddTrait, trait),
    // additionalTriggerCostForCard: (func) => EffectBuilder.card.static(EffectName.AdditionalTriggerCost, func),
    // attachmentCardCondition: (func) => EffectBuilder.card.static(EffectName.AttachmentCardCondition, func),
    // attachmentFactionRestriction: (factions) =>
    //     EffectBuilder.card.static(EffectName.AttachmentFactionRestriction, factions),
    // attachmentLimit: (amount) => EffectBuilder.card.static(EffectName.AttachmentLimit, amount),
    // attachmentMyControlOnly: () => EffectBuilder.card.static(EffectName.AttachmentMyControlOnly),
    // attachmentOpponentControlOnly: () => EffectBuilder.card.static(EffectName.AttachmentOpponentControlOnly),
    // attachmentRestrictTraitAmount: (object) =>
    //     EffectBuilder.card.static(EffectName.AttachmentRestrictTraitAmount, object),
    // attachmentTraitRestriction: (traits) => EffectBuilder.card.static(EffectName.AttachmentTraitRestriction, traits),
    // attachmentUniqueRestriction: () => EffectBuilder.card.static(EffectName.AttachmentUniqueRestriction),
    // blank: (blankTraits = false) => EffectBuilder.card.static(EffectName.Blank, blankTraits),
    // calculatePrintedMilitarySkill: (func) => EffectBuilder.card.static(EffectName.CalculatePrintedMilitarySkill, func),
    // canPlayFromOutOfPlay: (player, playType = PlayType.PlayFromHand) =>
    //     EffectBuilder.card.flexible(
    //         EffectName.CanPlayFromOutOfPlay,
    //         Object.assign({ player: player, playType: playType })
    //     ),
    // registerToPlayFromOutOfPlay: () =>
    //     EffectBuilder.card.detached(EffectName.CanPlayFromOutOfPlay, {
    //         apply: (card) => {
    //             for (const reaction of card.reactions) {
    //                 reaction.registerEvents();
    //             }
    //         },
    //         unapply: () => true
    //     }),
    // canBeSeenWhenFacedown: () => EffectBuilder.card.static(EffectName.CanBeSeenWhenFacedown),
    // canBeTriggeredByOpponent: () => EffectBuilder.card.static(EffectName.CanBeTriggeredByOpponent),
    // canOnlyBeDeclaredAsAttackerWithElement: (element) =>
    //     EffectBuilder.card.flexible(EffectName.CanOnlyBeDeclaredAsAttackerWithElement, element),
    // cannotApplyLastingEffects: (condition) =>
    //     EffectBuilder.card.static(EffectName.CannotApplyLastingEffects, condition),
    // cannotHaveOtherRestrictedAttachments: (card) =>
    //     EffectBuilder.card.static(EffectName.CannotHaveOtherRestrictedAttachments, card),
    // cannotParticipateAsAttacker: (type = 'both') =>
    //     EffectBuilder.card.static(EffectName.CannotParticipateAsAttacker, type),
    // cannotParticipateAsDefender: (type = 'both') =>
    //     EffectBuilder.card.static(EffectName.CannotParticipateAsDefender, type),
    cardCannot,
    // changeContributionFunction: (func) => EffectBuilder.card.static(EffectName.ChangeContributionFunction, func),
    // changeType: (type) => EffectBuilder.card.static(EffectName.ChangeType, type),
    // characterProvidesAdditionalConflict: (type) =>
    //     EffectBuilder.card.detached(EffectName.AdditionalConflict, {
    //         apply: (card) => card.controller.addConflictOpportunity(type),
    //         unapply: (card) => card.controller.removeConflictOpportunity(type)
    //     }),
    // contributeToConflict: (player) => EffectBuilder.card.flexible(EffectName.ContributeToConflict, player),
    // canContributeWhileBowed: (properties) => EffectBuilder.card.static(EffectName.CanContributeWhileBowed, properties),
    // copyCard,
    // customDetachedCard: (properties) => EffectBuilder.card.detached(EffectName.CustomEffect, properties),
    // delayedEffect: (properties) => EffectBuilder.card.static(EffectName.DelayedEffect, properties),
    // doesNotBow: () => EffectBuilder.card.static(EffectName.DoesNotBow),
    // doesNotReady: () => EffectBuilder.card.static(EffectName.DoesNotReady),
    // entersPlayWithStatus: (status) => EffectBuilder.card.static(EffectName.EntersPlayWithStatus, status),
    // entersPlayForOpponent: () => EffectBuilder.card.static(EffectName.EntersPlayForOpponent),
    // fateCostToAttack: (amount = 1) => EffectBuilder.card.flexible(EffectName.FateCostToAttack, amount),
    // cardCostToAttackMilitary: (amount = 1) => EffectBuilder.card.flexible(EffectName.CardCostToAttackMilitary, amount),
    // fateCostToTarget: (properties) => EffectBuilder.card.flexible(EffectName.FateCostToTarget, properties),
    // gainAbility,
    // gainAllAbilities,
    // gainAllAbilitiesDynamic: (match) =>
    //     EffectBuilder.card.static(EffectName.GainAllAbilitiesDynamic, new GainAllAbiliitesDynamic(match)),
    // gainPlayAction: (playActionClass) =>
    //     EffectBuilder.card.detached(EffectName.GainPlayAction, {
    //         apply: (card) => {
    //             let action = new playActionClass(card);
    //             card.abilities.playActions.push(action);
    //             return action;
    //         },
    //         unapply: (card, context, playAction) =>
    //             (card.abilities.playActions = card.abilities.playActions.filter((action) => action !== playAction))
    //     }),
    // hideWhenFaceUp: () => EffectBuilder.card.static(EffectName.HideWhenFaceUp),
    // honorStatusDoesNotAffectLeavePlay: () => EffectBuilder.card.flexible(EffectName.HonorStatusDoesNotAffectLeavePlay),
    // honorStatusDoesNotModifySkill: () => EffectBuilder.card.flexible(EffectName.HonorStatusDoesNotModifySkill),
    // taintedStatusDoesNotCostHonor: () => EffectBuilder.card.flexible(EffectName.TaintedStatusDoesNotCostHonor),
    // honorStatusReverseModifySkill: () => EffectBuilder.card.flexible(EffectName.HonorStatusReverseModifySkill),
    // immunity: (properties) => EffectBuilder.card.static(EffectName.AbilityRestrictions, new Restriction(properties)),
    // increaseLimitOnAbilities: (abilities) => EffectBuilder.card.static(EffectName.IncreaseLimitOnAbilities, abilities),
    // increaseLimitOnPrintedAbilities: (abilities) =>
    //     EffectBuilder.card.static(EffectName.IncreaseLimitOnPrintedAbilities, abilities),
    // loseAllNonKeywordAbilities: () => EffectBuilder.card.static(EffectName.LoseAllNonKeywordAbilities),
    // loseKeyword: (keyword) => EffectBuilder.card.static(EffectName.LoseKeyword, keyword),
    // loseTrait: (trait) => EffectBuilder.card.static(EffectName.LoseTrait, trait),
    // modifyBaseMilitarySkillMultiplier: (value) =>
    //     EffectBuilder.card.flexible(EffectName.ModifyBaseMilitarySkillMultiplier, value),
    // modifyBasePoliticalSkillMultiplier: (value) =>
    //     EffectBuilder.card.flexible(EffectName.ModifyBasePoliticalSkillMultiplier, value),
    // modifyBothSkills: (value) => EffectBuilder.card.flexible(EffectName.ModifyBothSkills, value),
    // modifyMilitarySkill: (value) => EffectBuilder.card.flexible(EffectName.ModifyMilitarySkill, value),
    // switchAttachmentSkillModifiers,
    // attachmentMilitarySkillModifier,
    // modifyMilitarySkillMultiplier: (value) =>
    //     EffectBuilder.card.flexible(EffectName.ModifyMilitarySkillMultiplier, value),
    // modifyPoliticalSkill: (value) => EffectBuilder.card.flexible(EffectName.ModifyPoliticalSkill, value),
    // attachmentPoliticalSkillModifier,
    // modifyPoliticalSkillMultiplier: (value) =>
    //     EffectBuilder.card.flexible(EffectName.ModifyPoliticalSkillMultiplier, value),
    // modifyRestrictedAttachmentAmount: (value) =>
    //     EffectBuilder.card.flexible(EffectName.ModifyRestrictedAttachmentAmount, value),
    // mustBeChosen: (properties) =>
    //     EffectBuilder.card.static(
    //         EffectName.MustBeChosen,
    //         new Restriction(Object.assign({ type: 'target' }, properties))
    //     ),
    // mustBeDeclaredAsAttacker,
    // mustBeDeclaredAsAttackerIfType: (type = 'both') =>
    //     EffectBuilder.card.static(EffectName.MustBeDeclaredAsAttackerIfType, type),
    // mustBeDeclaredAsDefender: (type = 'both') => EffectBuilder.card.static(EffectName.MustBeDeclaredAsDefender, type),
    // setBaseDash: (type) => EffectBuilder.card.static(EffectName.SetBaseDash, type),
    // setBaseMilitarySkill: (value) => EffectBuilder.card.static(EffectName.SetBaseMilitarySkill, value),
    // setBasePoliticalSkill: (value) => EffectBuilder.card.static(EffectName.SetBasePoliticalSkill, value),
    // setBaseProvinceStrength: (value) => EffectBuilder.card.static(EffectName.SetBaseProvinceStrength, value),
    // setDash: (type) => EffectBuilder.card.static(EffectName.SetDash, type),
    // setMilitarySkill: (value) => EffectBuilder.card.static(EffectName.SetMilitarySkill, value),
    // setPoliticalSkill: (value) => EffectBuilder.card.static(EffectName.SetPoliticalSkill, value),
    // setProvinceStrength: (value) => EffectBuilder.card.static(EffectName.SetProvinceStrength, value),
    // setProvinceStrengthBonus: (value) => EffectBuilder.card.flexible(EffectName.SetProvinceStrengthBonus, value),
    // provinceCannotHaveSkillIncreased: (value) =>
    //     EffectBuilder.card.static(EffectName.ProvinceCannotHaveSkillIncreased, value),
    // suppressEffects: (condition) =>
    //     EffectBuilder.card.static(EffectName.SuppressEffects, new SuppressEffect(condition)),
    // takeControl: (player) => EffectBuilder.card.static(EffectName.TakeControl, player),
    // triggersAbilitiesFromHome: (properties) =>
    //     EffectBuilder.card.static(EffectName.TriggersAbilitiesFromHome, properties),
    // participatesFromHome: (properties) => EffectBuilder.card.static(EffectName.ParticipatesFromHome, properties),
    // unlessActionCost: (properties) => EffectBuilder.card.static(EffectName.UnlessActionCost, properties),
    // // Player effects
    // additionalAction: (amount = 1) => EffectBuilder.player.static(EffectName.AdditionalAction, amount),
    // additionalCardPlayed: (amount = 1) => EffectBuilder.player.flexible(EffectName.AdditionalCardPlayed, amount),
    // additionalCharactersInConflict: (amount) =>
    //     EffectBuilder.player.flexible(EffectName.AdditionalCharactersInConflict, amount),
    // additionalTriggerCost: (func) => EffectBuilder.player.static(EffectName.AdditionalTriggerCost, func),
    // additionalPlayCost: (func) => EffectBuilder.player.static(EffectName.AdditionalPlayCost, func),
    // canPlayFromOwn,
    // canPlayFromOpponents: (location, cards, sourceOfEffect, playType = PlayType.PlayFromHand) =>
    //     EffectBuilder.player.detached(EffectName.CanPlayFromOpponents, {
    //         apply: (player) => {
    //             if (!player.opponent) {
    //                 return;
    //             }
    //             for (const card of cards.filter(
    //                 (card) => card.type === CardType.Event && card.location === location
    //             )) {
    //                 for (const reaction of card.reactions) {
    //                     reaction.registerEvents();
    //                 }
    //             }
    //             for (const card of cards) {
    //                 if (!card.fromOutOfPlaySource) {
    //                     card.fromOutOfPlaySource = [];
    //                 }
    //                 card.fromOutOfPlaySource.push(sourceOfEffect);
    //             }
    //             return player.addPlayableLocation(playType, player.opponent, location, cards);
    //         },
    //         unapply: (player, context, location) => {
    //             player.removePlayableLocation(location);
    //             for (const card of location.cards) {
    //                 if (Array.isArray(card.fromOutOfPlaySource)) {
    //                     card.fromOutOfPlaySource.filter((a) => a !== context.source);
    //                     if (card.fromOutOfPlaySource.length === 0) {
    //                         delete card.fromOutOfPlaySource;
    //                     }
    //                 }
    //             }
    //         }
    //     }),
    // changePlayerSkillModifier: (value) => EffectBuilder.player.flexible(EffectName.ChangePlayerSkillModifier, value),
    // customDetachedPlayer: (properties) => EffectBuilder.player.detached(EffectName.CustomEffect, properties),
    // gainActionPhasePriority: () =>
    //     EffectBuilder.player.detached(EffectName.GainActionPhasePriority, {
    //         apply: (player) => (player.actionPhasePriority = true),
    //         unapply: (player) => (player.actionPhasePriority = false)
    //     }),
    increaseCost: (properties) => Effects.modifyCost(Object.assign({}, properties, { amount: -properties.amount })),
    // modifyCardsDrawnInDrawPhase: (amount) =>
    //     EffectBuilder.player.flexible(EffectName.ModifyCardsDrawnInDrawPhase, amount),
    // playerCannot: (properties) =>
    //     EffectBuilder.player.static(
    //         EffectName.AbilityRestrictions,
    //         new Restriction(Object.assign({ type: properties.cannot || properties }, properties))
    //     ),
    // playerDelayedEffect: (properties) => EffectBuilder.player.static(EffectName.DelayedEffect, properties),
    // playerFateCostToTargetCard: (properties) =>
    //     EffectBuilder.player.flexible(
    //         EffectName.PlayerFateCostToTargetCard,
    //         properties
    //     ) /* amount: number; match: (card) => boolean */,
    modifyCost,
    // reduceNextPlayedCardCost: (amount, match) =>
    //     EffectBuilder.player.detached(EffectName.CostReducer, {
    //         apply: (player, context) =>
    //             player.addCostReducer(context.source, { amount: amount, match: match, limit: AbilityLimit.fixed(1) }),
    //         unapply: (player, context, reducer) => player.removeCostReducer(reducer)
    //     }),
    // satisfyAffinity: (traits) => EffectBuilder.player.static(EffectName.SatisfyAffinity, traits),
    // setConflictDeclarationType: (type) => EffectBuilder.player.static(EffectName.SetConflictDeclarationType, type),
    // provideConflictDeclarationType: (type) =>
    //     EffectBuilder.player.static(EffectName.ProvideConflictDeclarationType, type),
    // forceConflictDeclarationType: (type) => EffectBuilder.player.static(EffectName.ForceConflictDeclarationType, type),
    // setMaxConflicts: (amount) => EffectBuilder.player.static(EffectName.SetMaxConflicts, amount),
    // setConflictTotalSkill: (value) => EffectBuilder.player.static(EffectName.SetConflictTotalSkill, value),
    // showTopConflictCard: (players = RelativePlayer.Any) =>
    //     EffectBuilder.player.static(EffectName.ShowTopConflictCard, players),
    // eventsCannotBeCancelled: () => EffectBuilder.player.static(EffectName.EventsCannotBeCancelled),
    // restartDynastyPhase: (source) => EffectBuilder.player.static(EffectName.RestartDynastyPhase, source),
    // defendersChosenFirstDuringConflict: (amountOfAttackers) =>
    //     EffectBuilder.player.static(EffectName.DefendersChosenFirstDuringConflict, amountOfAttackers),
    // costToDeclareAnyParticipants: (properties) =>
    //     EffectBuilder.player.static(EffectName.CostToDeclareAnyParticipants, properties),
    // changeConflictSkillFunctionPlayer: (func) =>
    //     EffectBuilder.player.static(EffectName.ChangeConflictSkillFunction, func), // TODO: Add this to lasting effect checks
    // limitLegalAttackers: (matchFunc) => EffectBuilder.player.static(EffectName.LimitLegalAttackers, matchFunc), //matchFunc: (card) => bool
    // additionalActionAfterWindowCompleted: (amount = 1) =>
    //     EffectBuilder.player.static(EffectName.AdditionalActionAfterWindowCompleted, amount),
    // // Conflict effects
    // charactersCannot: (properties) =>
    //     EffectBuilder.conflict.static(
    //         EffectName.AbilityRestrictions,
    //         new Restriction(
    //             Object.assign({ restricts: 'characters', type: properties.cannot || properties }, properties)
    //         )
    //     ),
    // cannotContribute: (func) => EffectBuilder.conflict.dynamic(EffectName.CannotContribute, func),
    // changeConflictSkillFunction: (func) => EffectBuilder.conflict.static(EffectName.ChangeConflictSkillFunction, func), // TODO: Add this to lasting effect checks
    // modifyConflictElementsToResolve: (value) =>
    //     EffectBuilder.conflict.static(EffectName.ModifyConflictElementsToResolve, value), // TODO: Add this to lasting effect checks
    // restrictNumberOfDefenders: (value) => EffectBuilder.conflict.static(EffectName.RestrictNumberOfDefenders, value), // TODO: Add this to lasting effect checks
    // resolveConflictEarly: () => EffectBuilder.player.static(EffectName.ResolveConflictEarly),
    // forceConflictUnopposed: () => EffectBuilder.conflict.static(EffectName.ForceConflictUnopposed),
    // additionalAttackedProvince: (province) =>
    //     EffectBuilder.conflict.static(EffectName.AdditionalAttackedProvince, province),
    // conflictIgnoreStatusTokens: () => EffectBuilder.conflict.static(EffectName.ConflictIgnoreStatusTokens),
};

module.exports = Effects;
