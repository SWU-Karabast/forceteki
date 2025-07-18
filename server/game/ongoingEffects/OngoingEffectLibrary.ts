// const GainAllAbiliitesDynamic = require('./Effects/GainAllAbilitiesDynamic.js');
// const Restriction = require('./Effects/restriction.js');
// const { SuppressEffect } = require('./Effects/SuppressEffect');
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
// const { canPlayFromOwn } = require('./Effects/Library/canPlayFromOwn');
import { cardCannot } from './CardCannot';
// const { copyCard } = require('./Effects/Library/copyCard');
// const { gainAllAbilities } = require('./Effects/Library/GainAllAbilities');
// const { mustBeDeclaredAsAttacker } = require('./Effects/Library/mustBeDeclaredAsAttacker');
import { addExploit, modifyCost } from './ModifyCost';
// const { switchAttachmentSkillModifiers } = require('./Effects/Library/switchAttachmentSkillModifiers');
import type { KeywordName, Trait } from '../core/Constants';
import { EffectName } from '../core/Constants';
import type { StatsModifier } from '../core/ongoingEffect/effectImpl/StatsModifier';
import type { IAbilityPropsWithType, ITriggeredAbilityProps, KeywordNameOrProperties } from '../Interfaces';
import { GainAbility } from '../core/ongoingEffect/effectImpl/GainAbility';
import type { IForFreeCostAdjusterProperties, IIgnoreAllAspectsCostAdjusterProperties, IIgnoreSpecificAspectsCostAdjusterProperties, IIncreaseOrDecreaseCostAdjusterProperties, IModifyPayStageCostAdjusterProperties } from '../core/cost/CostAdjuster';
import { CostAdjustType } from '../core/cost/CostAdjuster';
import type { CalculateOngoingEffect } from '../core/ongoingEffect/effectImpl/DynamicOngoingEffectImpl';
import type { IExploitCostAdjusterProperties } from '../abilities/keyword/exploit/ExploitCostAdjuster';
import { playerCannot } from './PlayerCannot';
import type { PilotLimitModifier } from '../core/ongoingEffect/effectImpl/PilotLimitModifier';
import type { StartingHandSizeModifier } from '../core/ongoingEffect/effectImpl/StartingHandSizeModifier';
import type { IndirectDamageModifier } from '../core/ongoingEffect/effectImpl/IndirectDamageModifier';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { PlayFromDiscardProperties } from '../core/ongoingEffect/effectImpl/PlayFromDiscardProperties';
import type { CanAttackMultipleUnitsSimultaneously } from '../core/ongoingEffect/effectImpl/CanAttackMultipleUnitsSimultaneously';
import type { MustAttackProperties } from '../core/ongoingEffect/effectImpl/MustAttackProperties';
import { GainKeyword } from '../core/ongoingEffect/effectImpl/GainKeyword';
import StatsModifierWrapper from '../core/ongoingEffect/effectImpl/StatsModifierWrapper';
import { OngoingEffectValueWrapper } from '../core/ongoingEffect/effectImpl/OngoingEffectValueWrapper';
import type { NumericKeywordMultiplier } from '../core/ongoingEffect/effectImpl/NumericKeywordMultiplier';
import type { PrintedAttributesOverride } from '../core/ongoingEffect/effectImpl/PrintedAttributesOverride';
import type { Card } from '../core/card/Card';
import { CloneUnitEffect } from '../core/ongoingEffect/effectImpl/CloneUnitEffect';

/* Types of effect
    1. Static effects - do something for a period
    2. Dynamic effects - like static, but what they do depends on the game state
    3. Detached effects - do something when applied, and on expiration, but can be ignored in the interim
*/

export = {
    assignIndirectDamageDealtToOpponents: () => OngoingEffectBuilder.player.static(EffectName.AssignIndirectDamageDealtToOpponents),
    assignIndirectDamageDealtByUnit: () => OngoingEffectBuilder.card.static(EffectName.AssignIndirectDamageDealtByUnit),
    // Card effects
    // addFaction: (faction) => OngoingEffectBuilder.card.static(EffectName.AddFaction, faction),
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

    // canPlayFromOutOfPlay: (player, playType = PlayType.PlayFromHand) =>
    //    OngoingEffectBuilder.card.flexible(
    //        EffectName.CanPlayFromOutOfPlay,
    //        Object.assign({ player: player, playType: playType })
    //    ),

    // registerToPlayFromOutOfPlay: () =>
    //    OngoingEffectBuilder.card.detached(EffectName.CanPlayFromDiscard, {
    //        apply: (card) => {
    //            for (const triggeredAbility of card.getTriggeredAbilities()) {
    //                triggeredAbility.registerEvents();
    //            }
    //        },
    //        unapply: () => true
    //    }),

    canAttackMultipleUnitsSimultaneously: (effectImpl: CanAttackMultipleUnitsSimultaneously) => OngoingEffectBuilder.card.static(EffectName.CanAttackMultipleUnitsSimultaneously, effectImpl),
    canPlayFromDiscard: (properties: PlayFromDiscardProperties = {}) => OngoingEffectBuilder.card
        .static(EffectName.CanPlayFromDiscard, properties),
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
    cannotAttack: () => OngoingEffectBuilder.card.static(EffectName.CannotAttack),
    dealsDamageBeforeDefender: () => OngoingEffectBuilder.card.static(EffectName.DealsDamageBeforeDefender),
    cardCannot,
    playerCannot,
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
    delayedEffect: (properties: ITriggeredAbilityProps) => OngoingEffectBuilder.card.static(EffectName.DelayedEffect, properties),
    // doesNotBow: () => OngoingEffectBuilder.card.static(EffectName.DoesNotBow),
    // doesNotReady: () => OngoingEffectBuilder.card.static(EffectName.DoesNotReady),
    // entersPlayWithStatus: (status) => OngoingEffectBuilder.card.static(EffectName.EntersPlayWithStatus, status),
    // fateCostToAttack: (amount = 1) => OngoingEffectBuilder.card.flexible(EffectName.FateCostToAttack, amount),
    // cardCostToAttackMilitary: (amount = 1) => OngoingEffectBuilder.card.flexible(EffectName.CardCostToAttackMilitary, amount),
    // fateCostToTarget: (properties) => OngoingEffectBuilder.card.flexible(EffectName.FateCostToTarget, properties),
    cloneUnit: (target: Card) => OngoingEffectBuilder.card.static(EffectName.CloneUnit, (game) => new CloneUnitEffect(game, target)),
    isLeader: () => OngoingEffectBuilder.card.static(EffectName.IsLeader),
    gainAbility: (properties: IAbilityPropsWithType) =>
        OngoingEffectBuilder.card.static(EffectName.GainAbility, (game) => new GainAbility(game, properties)),
    // TODO BUG: if multiple cards gain keywords from the same effect and one of them is blanked, they will all be blanked
    gainKeyword: (keywordOrKeywordProperties: KeywordNameOrProperties | CalculateOngoingEffect<KeywordNameOrProperties>) => {
        switch (typeof keywordOrKeywordProperties) {
            case 'function':
                return OngoingEffectBuilder.card.dynamic(EffectName.GainKeyword,
                    (target, context, game) => new GainKeyword(game, keywordOrKeywordProperties(target, context, game)));
            default:
                return OngoingEffectBuilder.card.static(EffectName.GainKeyword, (game) => new GainKeyword(game, keywordOrKeywordProperties));
        }
    },
    gainKeywords: (calculate: (target: any, context: AbilityContext) => KeywordNameOrProperties[]) =>
        OngoingEffectBuilder.card.dynamic(EffectName.GainKeyword, (target, context, game) => new GainKeyword(game, calculate(target, context))),
    multiplyNumericKeyword: (multiplier: NumericKeywordMultiplier) => OngoingEffectBuilder.card.static(EffectName.MultiplyNumericKeyword, multiplier),
    loseAllAbilities: () => OngoingEffectBuilder.card.static(EffectName.Blank),
    loseKeyword: (keyword: KeywordName) => OngoingEffectBuilder.card.static(EffectName.LoseKeyword, keyword),
    overridePrintedAttributes: (printedAttributesOverride: PrintedAttributesOverride) => OngoingEffectBuilder.card.static(EffectName.PrintedAttributesOverride, printedAttributesOverride),
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
    gainTrait: (trait: Trait) => OngoingEffectBuilder.card.static(EffectName.GainTrait, trait),
    loseTrait: (trait: Trait) => OngoingEffectBuilder.card.static(EffectName.LoseTrait, trait),
    // modifyBaseMilitarySkillMultiplier: (value) =>
    //     OngoingEffectBuilder.card.flexible(EffectName.ModifyBaseMilitarySkillMultiplier, value),
    // modifyBasePoliticalSkillMultiplier: (value) =>
    //     OngoingEffectBuilder.card.flexible(EffectName.ModifyBasePoliticalSkillMultiplier, value),
    modifyIndirectDamage: (modifier: IndirectDamageModifier) => OngoingEffectBuilder.player.static(EffectName.ModifyIndirectDamage, modifier),
    modifyPilotingLimit: (modifier: PilotLimitModifier) => OngoingEffectBuilder.card.static(EffectName.ModifyPilotLimit, modifier),
    modifyStartingHandSize: (modifier: StartingHandSizeModifier) => OngoingEffectBuilder.card.static(EffectName.ModifyStartingHandSize, modifier),
    modifyStats: (modifier: StatsModifier | CalculateOngoingEffect<StatsModifier>) => {
        switch (typeof modifier) {
            case 'function':
                return OngoingEffectBuilder.card.dynamic(EffectName.ModifyStats, modifier);
            default:
                return OngoingEffectBuilder.card.static(
                    EffectName.ModifyStats,
                    (game) => new OngoingEffectValueWrapper(game, modifier, { format: 'give {0}', args: [StatsModifierWrapper.statsModifierDescription(modifier)] })
                );
        }
    },
    noMulligan: () => OngoingEffectBuilder.card.static(EffectName.NoMulligan),
    mustAttack: (properties: MustAttackProperties = {}) => OngoingEffectBuilder.card.static(EffectName.MustAttack, properties),
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
    cannotBeDefeatedByDamage: () => OngoingEffectBuilder.card.static(EffectName.CannotBeDefeatedByDamage),
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
    additionalAction: () => OngoingEffectBuilder.player.static(EffectName.AdditionalAction, (game) => new OngoingEffectValueWrapper(game, true, 'give an additional action')),
    // additionalCardPlayed: (amount = 1) => OngoingEffectBuilder.player.flexible(EffectName.AdditionalCardPlayed, amount),
    // additionalCharactersInConflict: (amount) =>
    //     OngoingEffectBuilder.player.flexible(EffectName.AdditionalCharactersInConflict, amount),
    // additionalTriggerCost: (func) => OngoingEffectBuilder.player.static(EffectName.AdditionalTriggerCost, func),
    // additionalPlayCost: (func) => OngoingEffectBuilder.player.static(EffectName.AdditionalPlayCost, func),
    // canPlayFromOwn,
    // canPlayFromOpponents: (zone, cards, sourceOfEffect, playType = PlayType.PlayFromHand) =>
    //     OngoingEffectBuilder.player.detached(EffectName.CanPlayFromOpponents, {
    //         apply: (player) => {
    //             if (!player.opponent) {
    //                 return;
    //             }
    //             for (const card of cards.filter(
    //                 (card) => card.isEvent() && card.zoneName === zone
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
    //             return player.addPlayableZone(playType, player.opponent, zone, cards);
    //         },
    //         unapply: (player, context, zone) => {
    //             player.removePlayableZone(zone);
    //             for (const card of zone.cards) {
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
    forFree: (properties: Omit<IForFreeCostAdjusterProperties, 'costAdjustType'>) => modifyCost({ costAdjustType: CostAdjustType.Free, ...properties }),
    modifyPayStageCost: (properties: Omit<IModifyPayStageCostAdjusterProperties, 'costAdjustType'>) => modifyCost({ costAdjustType: CostAdjustType.ModifyPayStage, ...properties }),
    ignoreAllAspectPenalties: (properties: Omit<IIgnoreAllAspectsCostAdjusterProperties, 'costAdjustType'>) => modifyCost({ costAdjustType: CostAdjustType.IgnoreAllAspects, ...properties }),
    ignoreSpecificAspectPenalties: (properties: Omit<IIgnoreSpecificAspectsCostAdjusterProperties, 'costAdjustType'>) => modifyCost({ costAdjustType: CostAdjustType.IgnoreSpecificAspects, ...properties }),
    ignorePilotingPilotLimit: () => OngoingEffectBuilder.card.static(EffectName.CanBePlayedWithPilotingIgnoringPilotLimit),
    addExploit: (properties: IExploitCostAdjusterProperties) => addExploit(properties),
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
    // showTopConflictCard: (players = WildcardRelativePlayer.Any) =>
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

