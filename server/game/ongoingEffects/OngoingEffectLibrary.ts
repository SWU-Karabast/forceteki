// const GainAllAbiliitesDynamic = require('./Effects/GainAllAbilitiesDynamic.js');
// const Restriction = require('./Effects/restriction.js');
// const { SuppressEffect } = require('./Effects/SuppressEffect');
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
// const { canPlayFromOwn } = require('./Effects/Library/canPlayFromOwn');
import { cardCannot } from './CardCannot';
// const { copyCard } = require('./Effects/Library/copyCard');
// const { gainAllAbilities } = require('./Effects/Library/GainAllAbilities');
// const { mustBeDeclaredAsAttacker } = require('./Effects/Library/mustBeDeclaredAsAttacker');
import { modifyCost } from './ModifyCost';
// const { switchAttachmentSkillModifiers } = require('./Effects/Library/switchAttachmentSkillModifiers');
import { EffectName, PlayType, KeywordName } from '../core/Constants';
import { StatsModifier } from '../core/ongoingEffect/effectImpl/StatsModifier';
import { IActionAbilityPropsWithType, ITriggeredAbilityPropsWithType, KeywordNameOrProperties } from '../Interfaces';
import { GainAbility } from '../core/ongoingEffect/effectImpl/GainAbility';
import * as KeywordHelpers from '../core/ability/KeywordHelpers';
import { CostAdjustType, IIgnoreAllAspectsCostAdjusterProperties, IIgnoreSpecificAspectsCostAdjusterProperties, IIncreaseOrDecreaseCostAdjusterProperties } from '../core/cost/CostAdjuster';
import { LoseKeyword } from '../core/ongoingEffect/effectImpl/LoseKeyword';

/* Types of effect
    1. Static effects - do something for a period
    2. Dynamic effects - like static, but what they do depends on the game state
    3. Detached effects - do something when applied, and on expiration, but can be ignored in the interim
*/

export = {
    // Card effects
    // addFaction: (faction) => OngoingEffectBuilder.card.static(EffectName.AddFaction, faction),
    // addTrait: (trait) => OngoingEffectBuilder.card.static(EffectName.AddTrait, trait),
    // additionalTriggerCostForCard: (func) => OngoingEffectBuilder.card.static(EffectName.AdditionalTriggerCost, func),
    // attachmentCardCondition: (func) => OngoingEffectBuilder.card.static(EffectName.AttachmentCardCondition, func),
    // attachmentFactionRestriction: (factions) =>
    //     OngoingEffectBuilder.card.static(EffectName.AttachmentFactionRestriction, factions),
    // attachmentLimit: (amount) => OngoingEffectBuilder.card.static(EffectName.AttachmentLimit, amount),
    // attachmentMyControlOnly: () => OngoingEffectBuilder.card.static(EffectName.AttachmentMyControlOnly),
    // attachmentOpponentControlOnly: () => OngoingEffectBuilder.card.static(EffectName.AttachmentOpponentControlOnly),
    // attachmentRestrictTraitAmount: (object) =>
    //     OngoingEffectBuilder.card.static(EffectName.AttachmentRestrictTraitAmount, object),
    // attachmentTraitRestriction: (traits) => OngoingEffectBuilder.card.static(EffectName.AttachmentTraitRestriction, traits),
    // attachmentUniqueRestriction: () => OngoingEffectBuilder.card.static(EffectName.AttachmentUniqueRestriction),
    blankEventCard: () => OngoingEffectBuilder.card.static(EffectName.Blank),
    // calculatePrintedMilitarySkill: (func) => OngoingEffectBuilder.card.static(EffectName.CalculatePrintedMilitarySkill, func),

    /** @deprected This has not yet been tested */
    canPlayFromOutOfPlay: (player, playType = PlayType.PlayFromHand) =>
        OngoingEffectBuilder.card.flexible(
            EffectName.CanPlayFromOutOfPlay,
            Object.assign({ player: player, playType: playType })
        ),

    /** @deprected This has not yet been tested */
    registerToPlayFromOutOfPlay: () =>
        OngoingEffectBuilder.card.detached(EffectName.CanPlayFromOutOfPlay, {
            apply: (card) => {
                for (const triggeredAbility of card.getTriggeredAbilities()) {
                    triggeredAbility.registerEvents();
                }
            },
            unapply: () => true
        }),
    // canBeSeenWhenFacedown: () => OngoingEffectBuilder.card.static(EffectName.CanBeSeenWhenFacedown),
    // canBeTriggeredByOpponent: () => OngoingEffectBuilder.card.static(EffectName.CanBeTriggeredByOpponent),
    // canOnlyBeDeclaredAsAttackerWithElement: (element) =>
    //     OngoingEffectBuilder.card.flexible(EffectName.CanOnlyBeDeclaredAsAttackerWithElement, element),
    // cannotApplyLastingEffects: (condition) =>
    //     OngoingEffectBuilder.card.static(EffectName.CannotApplyLastingEffects, condition),
    // cannotHaveOtherRestrictedAttachments: (card) =>
    //     OngoingEffectBuilder.card.static(EffectName.CannotHaveOtherRestrictedAttachments, card),
    // cannotParticipateAsAttacker: (type = 'both') =>
    //     OngoingEffectBuilder.card.static(EffectName.CannotParticipateAsAttacker, type),
    // cannotParticipateAsDefender: (type = 'both') =>
    //     OngoingEffectBuilder.card.static(EffectName.CannotParticipat  eAsDefender, type),
    cannotAttackBase: () => OngoingEffectBuilder.card.static(EffectName.CannotAttackBase),
    dealsDamageBeforeDefender: () => OngoingEffectBuilder.card.static(EffectName.DealsDamageBeforeDefender),
    cardCannot,
    // changeContributionFunction: (func) => OngoingEffectBuilder.card.static(EffectName.ChangeContributionFunction, func),
    // changeType: (type) => OngoingEffectBuilder.card.static(EffectName.ChangeType, type),
    // characterProvidesAdditionalConflict: (type) =>
    //     OngoingEffectBuilder.card.detached(EffectName.AdditionalConflict, {
    //         apply: (card) => card.controller.addConflictOpportunity(type),
    //         unapply: (card) => card.controller.removeConflictOpportunity(type)
    //     }),
    // contributeToConflict: (player) => OngoingEffectBuilder.card.flexible(EffectName.ContributeToConflict, player),
    // canContributeWhileBowed: (properties) => OngoingEffectBuilder.card.static(EffectName.CanContributeWhileBowed, properties),
    // copyCard,
    // customDetachedCard: (properties) => OngoingEffectBuilder.card.detached(EffectName.CustomEffect, properties),
    // delayedEffect: (properties) => OngoingEffectBuilder.card.static(EffectName.DelayedEffect, properties),
    // doesNotBow: () => OngoingEffectBuilder.card.static(EffectName.DoesNotBow),
    // doesNotReady: () => OngoingEffectBuilder.card.static(EffectName.DoesNotReady),
    // entersPlayWithStatus: (status) => OngoingEffectBuilder.card.static(EffectName.EntersPlayWithStatus, status),
    // entersPlayForOpponent: () => OngoingEffectBuilder.card.static(EffectName.EntersPlayForOpponent),
    // fateCostToAttack: (amount = 1) => OngoingEffectBuilder.card.flexible(EffectName.FateCostToAttack, amount),
    // cardCostToAttackMilitary: (amount = 1) => OngoingEffectBuilder.card.flexible(EffectName.CardCostToAttackMilitary, amount),
    // fateCostToTarget: (properties) => OngoingEffectBuilder.card.flexible(EffectName.FateCostToTarget, properties),
    gainAbility: (properties: IActionAbilityPropsWithType | ITriggeredAbilityPropsWithType) =>
        OngoingEffectBuilder.card.static(EffectName.GainAbility, new GainAbility(properties)),
    gainKeyword: (keywordOrKeywordProperties: KeywordNameOrProperties) =>
        OngoingEffectBuilder.card.static(EffectName.GainKeyword,
            typeof keywordOrKeywordProperties === 'string'
                ? KeywordHelpers.keywordFromProperties({ keyword: keywordOrKeywordProperties })
                : KeywordHelpers.keywordFromProperties(keywordOrKeywordProperties)),
    loseKeyword: (keyword: KeywordName) => OngoingEffectBuilder.card.static(EffectName.LoseKeyword, new LoseKeyword(keyword)),
    // gainAllAbilities,
    // gainAllAbilitiesDynamic: (match) =>
    //     OngoingEffectBuilder.card.static(EffectName.GainAllAbilitiesDynamic, new GainAllAbiliitesDynamic(match)),
    // gainPlayAction: (playActionClass) =>
    //     OngoingEffectBuilder.card.detached(EffectName.GainPlayAction, {
    //         apply: (card) => {
    //             let action = new playActionClass(card);
    //             card.abilities.playActions.push(action);
    //             return action;
    //         },
    //         unapply: (card, context, playAction) =>
    //             (card.abilities.playActions = card.abilities.playActions.filter((action) => action !== playAction))
    //     }),
    // hideWhenFaceUp: () => OngoingEffectBuilder.card.static(EffectName.HideWhenFaceUp),
    // honorStatusDoesNotAffectLeavePlay: () => OngoingEffectBuilder.card.flexible(EffectName.HonorStatusDoesNotAffectLeavePlay),
    // honorStatusDoesNotModifySkill: () => OngoingEffectBuilder.card.flexible(EffectName.HonorStatusDoesNotModifySkill),
    // taintedStatusDoesNotCostHonor: () => OngoingEffectBuilder.card.flexible(EffectName.TaintedStatusDoesNotCostHonor),
    // honorStatusReverseModifySkill: () => OngoingEffectBuilder.card.flexible(EffectName.HonorStatusReverseModifySkill),
    // immunity: (properties) => OngoingEffectBuilder.card.static(EffectName.AbilityRestrictions, new Restriction(properties)),
    // increaseLimitOnAbilities: (abilities) => OngoingEffectBuilder.card.static(EffectName.IncreaseLimitOnAbilities, abilities),
    // increaseLimitOnPrintedAbilities: (abilities) =>
    //     OngoingEffectBuilder.card.static(EffectName.IncreaseLimitOnPrintedAbilities, abilities),
    // loseAllNonKeywordAbilities: () => OngoingEffectBuilder.card.static(EffectName.LoseAllNonKeywordAbilities),
    // loseTrait: (trait) => OngoingEffectBuilder.card.static(EffectName.LoseTrait, trait),
    // modifyBaseMilitarySkillMultiplier: (value) =>
    //     OngoingEffectBuilder.card.flexible(EffectName.ModifyBaseMilitarySkillMultiplier, value),
    // modifyBasePoliticalSkillMultiplier: (value) =>
    //     OngoingEffectBuilder.card.flexible(EffectName.ModifyBasePoliticalSkillMultiplier, value),
    modifyStats: (modifier: StatsModifier) => OngoingEffectBuilder.card.flexible(EffectName.ModifyStats, modifier),
    // modifyMilitarySkill: (value) => OngoingEffectBuilder.card.flexible(EffectName.ModifyMilitarySkill, value),
    // switchAttachmentSkillModifiers,
    // modifyMilitarySkillMultiplier: (value) =>
    //     OngoingEffectBuilder.card.flexible(EffectName.ModifyMilitarySkillMultiplier, value),
    // modifyPoliticalSkill: (value) => OngoingEffectBuilder.card.flexible(EffectName.ModifyPoliticalSkill, value),
    // attachmentPoliticalSkillModifier,
    // modifyPoliticalSkillMultiplier: (value) =>
    //     OngoingEffectBuilder.card.flexible(EffectName.ModifyPoliticalSkillMultiplier, value),
    // modifyRestrictedAttachmentAmount: (value) =>
    //     OngoingEffectBuilder.card.flexible(EffectName.ModifyRestrictedAttachmentAmount, value),
    // mustBeChosen: (properties) =>
    //     OngoingEffectBuilder.card.static(
    //         EffectName.MustBeChosen,
    //         new Restriction(Object.assign({ type: 'target' }, properties))
    //     ),
    // mustBeDeclaredAsAttacker,
    // mustBeDeclaredAsAttackerIfType: (type = 'both') =>
    //     OngoingEffectBuilder.card.static(EffectName.MustBeDeclaredAsAttackerIfType, type),
    // mustBeDeclaredAsDefender: (type = 'both') => OngoingEffectBuilder.card.static(EffectName.MustBeDeclaredAsDefender, type),
    // setBaseDash: (type) => OngoingEffectBuilder.card.static(EffectName.SetBaseDash, type),
    // setBaseMilitarySkill: (value) => OngoingEffectBuilder.card.static(EffectName.SetBaseMilitarySkill, value),
    // setBasePoliticalSkill: (value) => OngoingEffectBuilder.card.static(EffectName.SetBasePoliticalSkill, value),
    // setBaseProvinceStrength: (value) => OngoingEffectBuilder.card.static(EffectName.SetBaseProvinceStrength, value),
    // setDash: (type) => OngoingEffectBuilder.card.static(EffectName.SetDash, type),
    // setMilitarySkill: (value) => OngoingEffectBuilder.card.static(EffectName.SetMilitarySkill, value),
    // setPoliticalSkill: (value) => OngoingEffectBuilder.card.static(EffectName.SetPoliticalSkill, value),
    // setProvinceStrength: (value) => OngoingEffectBuilder.card.static(EffectName.SetProvinceStrength, value),
    // setProvinceStrengthBonus: (value) => OngoingEffectBuilder.card.flexible(EffectName.SetProvinceStrengthBonus, value),
    // provinceCannotHaveSkillIncreased: (value) =>
    //     OngoingEffectBuilder.card.static(EffectName.ProvinceCannotHaveSkillIncreased, value),
    // suppressEffects: (condition) =>
    //     OngoingEffectBuilder.card.static(EffectName.SuppressEffects, new SuppressEffect(condition)),
    // takeControl: (player) => OngoingEffectBuilder.card.static(EffectName.TakeControl, player),
    // triggersAbilitiesFromHome: (properties) =>
    //     OngoingEffectBuilder.card.static(EffectName.TriggersAbilitiesFromHome, properties),
    // participatesFromHome: (properties) => OngoingEffectBuilder.card.static(EffectName.ParticipatesFromHome, properties),
    // unlessActionCost: (properties) => OngoingEffectBuilder.card.static(EffectName.UnlessActionCost, properties),
    // // Player effects
    // additionalAction: (amount = 1) => OngoingEffectBuilder.player.static(EffectName.AdditionalAction, amount),
    // additionalCardPlayed: (amount = 1) => OngoingEffectBuilder.player.flexible(EffectName.AdditionalCardPlayed, amount),
    // additionalCharactersInConflict: (amount) =>
    //     OngoingEffectBuilder.player.flexible(EffectName.AdditionalCharactersInConflict, amount),
    // additionalTriggerCost: (func) => OngoingEffectBuilder.player.static(EffectName.AdditionalTriggerCost, func),
    // additionalPlayCost: (func) => OngoingEffectBuilder.player.static(EffectName.AdditionalPlayCost, func),
    // canPlayFromOwn,
    // canPlayFromOpponents: (location, cards, sourceOfEffect, playType = PlayType.PlayFromHand) =>
    //     OngoingEffectBuilder.player.detached(EffectName.CanPlayFromOpponents, {
    //         apply: (player) => {
    //             if (!player.opponent) {
    //                 return;
    //             }
    //             for (const card of cards.filter(
    //                 (card) => card.isEvent() && card.location === location
    //             )) {
    //                 for (const reaction of card.getTriggeredAbilities()) {
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
    // changePlayerSkillModifier: (value) => OngoingEffectBuilder.player.flexible(EffectName.ChangePlayerSkillModifier, value),
    // customDetachedPlayer: (properties) => OngoingEffectBuilder.player.detached(EffectName.CustomEffect, properties),
    decreaseCost: (properties: Omit<IIncreaseOrDecreaseCostAdjusterProperties, 'costAdjustType'>) => modifyCost({ costAdjustType: CostAdjustType.Decrease, ...properties }),
    // gainActionPhasePriority: () =>
    //     OngoingEffectBuilder.player.detached(EffectName.GainActionPhasePriority, {
    //         apply: (player) => (player.actionPhasePriority = true),
    //         unapply: (player) => (player.actionPhasePriority = false)
    //     }),
    increaseCost: (properties: Omit<IIncreaseOrDecreaseCostAdjusterProperties, 'costAdjustType'>) => modifyCost({ costAdjustType: CostAdjustType.Increase, ...properties }),
    ignoreAllAspectPenalties: (properties: Omit<IIgnoreAllAspectsCostAdjusterProperties, 'costAdjustType'>) => modifyCost({ costAdjustType: CostAdjustType.IgnoreAllAspects, ...properties }),
    ignoreSpecificAspectPenalties: (properties: Omit<IIgnoreSpecificAspectsCostAdjusterProperties, 'costAdjustType'>) => modifyCost({ costAdjustType: CostAdjustType.IgnoreSpecificAspects, ...properties }),
    // modifyCardsDrawnInDrawPhase: (amount) =>
    //     OngoingEffectBuilder.player.flexible(EffectName.ModifyCardsDrawnInDrawPhase, amount),
    // playerCannot: (properties) =>
    //     OngoingEffectBuilder.player.static(
    //         EffectName.AbilityRestrictions,
    //         new Restriction(Object.assign({ type: properties.cannot || properties }, properties))
    //     ),
    // playerDelayedEffect: (properties) => OngoingEffectBuilder.player.static(EffectName.DelayedEffect, properties),
    // playerFateCostToTargetCard: (properties) =>
    //     OngoingEffectBuilder.player.flexible(
    //         EffectName.PlayerFateCostToTargetCard,
    //         properties
    //     ) /* amount: number; match: (card) => boolean */,
    // reduceNextPlayedCardCost: (amount, match) =>
    //     OngoingEffectBuilder.player.detached(EffectName.CostReducer, {
    //         apply: (player, context) =>
    //             player.addCostReducer(context.source, { amount: amount, match: match, limit: AbilityLimit.fixed(1) }),
    //         unapply: (player, context, reducer) => player.removeCostReducer(reducer)
    //     }),
    // satisfyAffinity: (traits) => OngoingEffectBuilder.player.static(EffectName.SatisfyAffinity, traits),
    // setConflictDeclarationType: (type) => OngoingEffectBuilder.player.static(EffectName.SetConflictDeclarationType, type),
    // provideConflictDeclarationType: (type) =>
    //     OngoingEffectBuilder.player.static(EffectName.ProvideConflictDeclarationType, type),
    // forceConflictDeclarationType: (type) => OngoingEffectBuilder.player.static(EffectName.ForceConflictDeclarationType, type),
    // setMaxConflicts: (amount) => OngoingEffectBuilder.player.static(EffectName.SetMaxConflicts, amount),
    // setConflictTotalSkill: (value) => OngoingEffectBuilder.player.static(EffectName.SetConflictTotalSkill, value),
    // showTopConflictCard: (players = RelativePlayer.Any) =>
    //     OngoingEffectBuilder.player.static(EffectName.ShowTopConflictCard, players),
    // eventsCannotBeCancelled: () => OngoingEffectBuilder.player.static(EffectName.EventsCannotBeCancelled),
    // restartDynastyPhase: (source) => OngoingEffectBuilder.player.static(EffectName.RestartDynastyPhase, source),
    // defendersChosenFirstDuringConflict: (amountOfAttackers) =>
    //     OngoingEffectBuilder.player.static(EffectName.DefendersChosenFirstDuringConflict, amountOfAttackers),
    // costToDeclareAnyParticipants: (properties) =>
    //     OngoingEffectBuilder.player.static(EffectName.CostToDeclareAnyParticipants, properties),
    // limitLegalAttackers: (matchFunc) => OngoingEffectBuilder.player.static(EffectName.LimitLegalAttackers, matchFunc), //matchFunc: (card) => bool
    // additionalActionAfterWindowCompleted: (amount = 1) =>
    //     OngoingEffectBuilder.player.static(EffectName.AdditionalActionAfterWindowCompleted, amount),
    // // Conflict effects
    // charactersCannot: (properties) =>
    //     OngoingEffectBuilder.conflict.static(
    //         EffectName.AbilityRestrictions,
    //         new Restriction(
    //             Object.assign({ restricts: 'characters', type: properties.cannot || properties }, properties)
    //         )
    //     ),
    // cannotContribute: (func) => OngoingEffectBuilder.conflict.dynamic(EffectName.CannotContribute, func),
    // resolveConflictEarly: () => OngoingEffectBuilder.player.static(EffectName.ResolveConflictEarly),
    // forceConflictUnopposed: () => OngoingEffectBuilder.conflict.static(EffectName.ForceConflictUnopposed),
    // additionalAttackedProvince: (province) =>
    //     OngoingEffectBuilder.conflict.static(EffectName.AdditionalAttackedProvince, province),
    // conflictIgnoreStatusTokens: () => OngoingEffectBuilder.conflict.static(EffectName.ConflictIgnoreStatusTokens),
};

