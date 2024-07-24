const AbilityDsl = require('../abilitydsl.js');
const Effects = require('../effects/effects');
const EffectSource = require('../EffectSource.js');
import CardAbility = require('../CardAbility');
// import TriggeredAbility = require('./triggeredability');
import Game = require('../game.js');

import { GameModes } from '../../GameModes.js';
import { AbilityContext } from '../AbilityContext.js';
import { CardAction } from '../CardAction.js';
import {
    AbilityTypes,
    CardTypes,
    Durations,
    EffectNames,
    EventNames,
    Locations,
    isArena,
    Aspects,
    cardLocationMatches,
    WildcardLocations
} from '../Constants.js';
import {
    ActionProps,
    AttachmentConditionProps,
    PersistentEffectProps,
    TriggeredAbilityProps,
    TriggeredAbilityWhenProps
} from '../Interfaces';
// import { PlayAttachmentAction } from './PlayAttachmentAction.js';
// import { StatusToken } from './StatusToken';
import Player from '../player.js';
import type DeckCard = require('./deckcard');
import type { CardEffect } from '../effects/types';
// import type { GainAllAbilities } from './Effects/Library/gainAllAbilities';
import { PlayUnitAction } from '../gameActions/PlayUnitAction.js';

// TODO: convert enums to unions
type PrintedKeyword =
    | 'ancestral'
    | 'corrupted'
    | 'courtesy'
    | 'covert'
    | 'eminent'
    | 'ephemeral'
    | 'limited'
    | 'no duels'
    | 'peaceful'
    | 'pride'
    | 'rally'
    | 'restricted'
    | 'sincerity';

const ValidKeywords = new Set<PrintedKeyword>([
    'ancestral',
    'corrupted',
    'courtesy',
    'covert',
    'eminent',
    'ephemeral',
    'limited',
    'no duels',
    'peaceful',
    'pride',
    'rally',
    'restricted',
    'sincerity'
]);

// TODO: maybe rename this class for clarity
class BaseCard extends EffectSource {
    controller: Player;
    game: Game;

    id: string;
    printedTitle: string;
    printedSubtitle: string;
    internalName: string;
    type: CardTypes;
    facedown: boolean;
    resourced: boolean;

    tokens: object = {};
    menu: { command: string; text: string }[] = [];

    showPopup: boolean = false;
    popupMenuText: string = '';
    abilities: any = { actions: [], reactions: [], persistentEffects: [], playActions: [] };
    traits: string[];
    printedFaction: string;
    location: Locations;

    isBase: boolean = false;
    isLeader: boolean = false;

    upgrades = [] as DeckCard[];
    childCards = [] as DeckCard[];
    // statusTokens = [] as StatusToken[];
    allowedAttachmentTraits = [] as string[];
    printedKeywords: Array<string> = [];
    aspects: Array<Aspects> = [];

    constructor(
        public owner: Player,
        public cardData: any
    ) {
        super(owner.game);
        this.controller = owner;

        this.id = cardData.cardId;
        this.unique = cardData.unique;

        this.printedTitle = cardData.title;
        this.printedSubtitle = cardData.subtitle;
        this.internalName = cardData.internalname;
        this.printedType = this.#checkConvertToEnum([cardData.type], CardTypes)[0]; // TODO: does this work for leader consistently, since it has two types?
        this.traits = cardData.traits;  // TODO: enum for these
        this.aspects = this.#checkConvertToEnum(cardData.aspects, Aspects);
        this.printedKeywords = cardData.keywords;   // TODO: enum for these

        this.setupCardAbilities(AbilityDsl);
        this.parseKeywords(cardData.text ? cardData.text.replace(/<[^>]*>/g, '').toLowerCase() : '');
        // this.applyAttachmentBonus();
    }

    get name(): string {
        let copyEffect = this.mostRecentEffect(EffectNames.CopyCharacter);
        return copyEffect ? copyEffect.printedName : this.printedTitle;
    }

    set name(name: string) {
        this.printedTitle = name;
    }

    // convert a set of strings to map to an enum type, throw if any of them is not a legal value
    #checkConvertToEnum<T>(values: string[], enumObj: T): Array<T[keyof T]> {
        let result: Array<T[keyof T]> = [];
    
        for (const value of values) {
            if (Object.values(enumObj).indexOf(value.toLowerCase()) >= 0) {
                result.push(value as T[keyof T]);
            } else {
                throw new Error(`Invalid value for enum: ${value}`);
            }
        }
    
        return result;
    }

    #mostRecentEffect(predicate: (effect: CardEffect) => boolean): CardEffect | undefined {
        const effects = this.getRawEffects().filter(predicate);
        return effects[effects.length - 1];
    }

    _getActions(ignoreDynamicGains = false): CardAction[] {
        let actions = this.abilities.actions;
        const mostRecentEffect = this.#mostRecentEffect((effect) => effect.type === EffectNames.CopyCharacter);
        if (mostRecentEffect) {
            actions = mostRecentEffect.value.getActions(this);
        }
        const effectActions = this.getEffects(EffectNames.GainAbility).filter(
            (ability) => ability.abilityType === AbilityTypes.Action
        );

        // for (const effect of this.getRawEffects()) {
        //     if (effect.type === EffectNames.GainAllAbilities) {
        //         actions = actions.concat((effect.value as GainAllAbilities).getActions(this));
        //     }
        // }
        // if (!ignoreDynamicGains) {
        //     if (this.anyEffect(EffectNames.GainAllAbilitiesDynamic)) {
        //         const context = this.game.getFrameworkContext(this.controller);
        //         const effects = this.getRawEffects().filter(
        //             (effect) => effect.type === EffectNames.GainAllAbilitiesDynamic
        //         );
        //         effects.forEach((effect) => {
        //             effect.value.calculate(this, context); //fetch new abilities
        //             actions = actions.concat(effect.value.getActions(this));
        //         });
        //     }
        // }

        // const lostAllNonKeywordsAbilities = this.anyEffect(EffectNames.LoseAllNonKeywordAbilities);
        let allAbilities = actions.concat(effectActions);
        // if (lostAllNonKeywordsAbilities) {
        //     allAbilities = allAbilities.filter((a) => a.isKeywordAbility());
        // }
        return allAbilities;
    }

    get actions(): CardAction[] {
        return this._getActions();
    }

    // _getReactions(ignoreDynamicGains = false): TriggeredAbility[] {
    //     const TriggeredAbilityTypes = [
    //         AbilityTypes.ForcedInterrupt,
    //         AbilityTypes.ForcedReaction,
    //         AbilityTypes.Interrupt,
    //         AbilityTypes.Reaction,
    //         AbilityTypes.WouldInterrupt
    //     ];
    //     let reactions = this.abilities.reactions;
    //     const mostRecentEffect = this.#mostRecentEffect((effect) => effect.type === EffectNames.CopyCharacter);
    //     if (mostRecentEffect) {
    //         reactions = mostRecentEffect.value.getReactions(this);
    //     }
    //     const effectReactions = this.getEffects(EffectNames.GainAbility).filter((ability) =>
    //         TriggeredAbilityTypes.includes(ability.abilityType)
    //     );
    //     for (const effect of this.getRawEffects()) {
    //         if (effect.type === EffectNames.GainAllAbilities) {
    //             reactions = reactions.concat((effect.value as GainAllAbilities).getReactions(this));
    //         }
    //     }
    //     if (!ignoreDynamicGains) {
    //         if (this.anyEffect(EffectNames.GainAllAbilitiesDynamic)) {
    //             const effects = this.getRawEffects().filter(
    //                 (effect) => effect.type === EffectNames.GainAllAbilitiesDynamic
    //             );
    //             const context = this.game.getFrameworkContext(this.controller);
    //             effects.forEach((effect) => {
    //                 effect.value.calculate(this, context); //fetch new abilities
    //                 reactions = reactions.concat(effect.value.getReactions(this));
    //             });
    //         }
    //     }

    //     const lostAllNonKeywordsAbilities = this.anyEffect(EffectNames.LoseAllNonKeywordAbilities);
    //     let allAbilities = reactions.concat(effectReactions);
    //     if (lostAllNonKeywordsAbilities) {
    //         allAbilities = allAbilities.filter((a) => a.isKeywordAbility());
    //     }
    //     return allAbilities;
    // }

    // get reactions(): TriggeredAbility[] {
    //     return this._getReactions();
    // }

    // _getPersistentEffects(ignoreDynamicGains = false): any[] {
    //     let gainedPersistentEffects = this.getEffects(EffectNames.GainAbility).filter(
    //         (ability) => ability.abilityType === AbilityTypes.Persistent
    //     );

    //     const mostRecentEffect = this.#mostRecentEffect((effect) => effect.type === EffectNames.CopyCharacter);
    //     if (mostRecentEffect) {
    //         return gainedPersistentEffects.concat(mostRecentEffect.value.getPersistentEffects());
    //     }
    //     for (const effect of this.getRawEffects()) {
    //         if (effect.type === EffectNames.GainAllAbilities) {
    //             gainedPersistentEffects = gainedPersistentEffects.concat(
    //                 (effect.value as GainAllAbilities).getPersistentEffects()
    //             );
    //         }
    //     }
    //     if (!ignoreDynamicGains) {
    //         // This is needed even though there are no dynamic persistent effects
    //         // Because the effect itself is persistent and to ensure we pick up all reactions/interrupts, we need this check to happen
    //         // As the game state is applying the effect
    //         if (this.anyEffect(EffectNames.GainAllAbilitiesDynamic)) {
    //             const effects = this.getRawEffects().filter(
    //                 (effect) => effect.type === EffectNames.GainAllAbilitiesDynamic
    //             );
    //             const context = this.game.getFrameworkContext(this.controller);
    //             effects.forEach((effect) => {
    //                 effect.value.calculate(this, context); //fetch new abilities
    //                 gainedPersistentEffects = gainedPersistentEffects.concat(effect.value.getPersistentEffects());
    //             });
    //         }
    //     }

    //     const lostAllNonKeywordsAbilities = this.anyEffect(EffectNames.LoseAllNonKeywordAbilities);
    //     if (lostAllNonKeywordsAbilities) {
    //         let allAbilities = this.abilities.persistentEffects.concat(gainedPersistentEffects);
    //         allAbilities = allAbilities.filter((a) => a.isKeywordEffect || a.type === EffectNames.AddKeyword);
    //         return allAbilities;
    //     }
    //     return this.isBlank()
    //         ? gainedPersistentEffects
    //         : this.abilities.persistentEffects.concat(gainedPersistentEffects);
    // }

    get persistentEffects(): any[] {
        return this._getPersistentEffects();
    }

    /**
     * Create card abilities by calling subsequent methods with appropriate properties
     * @param {Object} ability - AbilityDsl object containing limits, costs, effects, and game actions
     */
    setupCardAbilities(ability) {
        // eslint-disable-line no-unused-vars
    }

    action(properties: ActionProps<this>): void {
        this.abilities.actions.push(this.createAction(properties));
    }

    createAction(properties: ActionProps): CardAction {
        return new CardAction(this.game, this, properties);
    }

    // triggeredAbility(abilityType: AbilityTypes, properties: TriggeredAbilityProps): void {
    //     this.abilities.reactions.push(this.createTriggeredAbility(abilityType, properties));
    // }

    // createTriggeredAbility(abilityType: AbilityTypes, properties: TriggeredAbilityProps): TriggeredAbility {
    //     return new TriggeredAbility(this.game, this, abilityType, properties);
    // }

    // reaction(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityTypes.Reaction, properties);
    // }

    // forcedReaction(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityTypes.ForcedReaction, properties);
    // }

    // wouldInterrupt(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityTypes.WouldInterrupt, properties);
    // }

    // interrupt(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityTypes.Interrupt, properties);
    // }

    // forcedInterrupt(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityTypes.ForcedInterrupt, properties);
    // }

    // /**
    //  * Applies an effect that continues as long as the card providing the effect
    //  * is both in play and not blank.
    //  */
    // persistentEffect(properties: PersistentEffectProps<this>): void {
    //     const allowedLocations = [
    //         Locations.Any,
    //         Locations.ConflictDiscardPile,
    //         Locations.PlayArea,
    //         Locations.Provinces
    //     ];
    //     const defaultLocationForType = {
    //         province: Locations.Provinces,
    //         holding: Locations.Provinces,
    //         stronghold: Locations.Provinces
    //     };

    //     let location = properties.location || defaultLocationForType[this.getType()] || isArena(properties.location);
    //     if (!allowedLocations.includes(location)) {
    //         throw new Error(`'${location}' is not a supported effect location.`);
    //     }
    //     this.abilities.persistentEffects.push({ duration: Durations.Persistent, location, ...properties });
    // }

    // attachmentConditions(properties: AttachmentConditionProps): void {
    //     const effects = [];
    //     if (properties.limit) {
    //         effects.push(Effects.attachmentLimit(properties.limit));
    //     }
    //     if (properties.myControl) {
    //         effects.push(Effects.attachmentMyControlOnly());
    //     }
    //     if (properties.opponentControlOnly) {
    //         effects.push(Effects.attachmentOpponentControlOnly());
    //     }
    //     if (properties.unique) {
    //         effects.push(Effects.attachmentUniqueRestriction());
    //     }
    //     if (properties.faction) {
    //         const factions = Array.isArray(properties.faction) ? properties.faction : [properties.faction];
    //         effects.push(Effects.attachmentFactionRestriction(factions));
    //     }
    //     if (properties.trait) {
    //         const traits = Array.isArray(properties.trait) ? properties.trait : [properties.trait];
    //         effects.push(Effects.attachmentTraitRestriction(traits));
    //     }
    //     if (properties.limitTrait) {
    //         const traitLimits = Array.isArray(properties.limitTrait) ? properties.limitTrait : [properties.limitTrait];
    //         traitLimits.forEach((traitLimit) => {
    //             const trait = Object.keys(traitLimit)[0];
    //             effects.push(Effects.attachmentRestrictTraitAmount({ [trait]: traitLimit[trait] }));
    //         });
    //     }
    //     if (properties.cardCondition) {
    //         effects.push(Effects.attachmentCardCondition(properties.cardCondition));
    //     }
    //     if (effects.length > 0) {
    //         this.persistentEffect({
    //             location: Locations.Any,
    //             effect: effects
    //         });
    //     }
    // }

    hasKeyword(keyword: string): boolean {
        const targetKeyword = keyword.toLowerCase();

        const addKeywordEffects = this.getEffects(EffectNames.AddKeyword).filter(
            (effectValue: string) => effectValue === targetKeyword
        );
        const loseKeywordEffects = this.getEffects(EffectNames.LoseKeyword).filter(
            (effectValue: string) => effectValue === targetKeyword
        );

        return addKeywordEffects.length > loseKeywordEffects.length;
    }

    hasPrintedKeyword(keyword: PrintedKeyword) {
        return this.printedKeywords.includes(keyword);
    }

    hasTrait(trait: string): boolean {
        return this.hasSomeTrait(trait);
    }

    hasEveryTrait(traits: Set<string>): boolean;
    hasEveryTrait(...traits: string[]): boolean;
    hasEveryTrait(traitSetOrFirstTrait: Set<string> | string, ...otherTraits: string[]): boolean {
        const traitsToCheck =
            traitSetOrFirstTrait instanceof Set
                ? traitSetOrFirstTrait
                : new Set([traitSetOrFirstTrait, ...otherTraits]);

        const cardTraits = this.getTraitSet();
        for (const trait of traitsToCheck) {
            if (!cardTraits.has(trait.toLowerCase())) {
                return false;
            }
        }
        return true;
    }

    hasSomeTrait(traits: Set<string>): boolean;
    hasSomeTrait(...traits: string[]): boolean;
    hasSomeTrait(traitSetOrFirstTrait: Set<string> | string, ...otherTraits: string[]): boolean {
        const traitsToCheck =
            traitSetOrFirstTrait instanceof Set
                ? traitSetOrFirstTrait
                : new Set([traitSetOrFirstTrait, ...otherTraits]);

        const cardTraits = this.getTraitSet();
        for (const trait of traitsToCheck) {
            if (cardTraits.has(trait.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    getTraits(): Set<string> {
        // return this.getTraitSet();
        return new Set();
    }

    // getTraitSet(): Set<string> {
    //     const copyEffect = this.mostRecentEffect(EffectNames.CopyCharacter);
    //     const set = new Set(
    //         copyEffect
    //             ? (copyEffect.traits as string[])
    //             : this.getEffects(EffectNames.Blank).some((blankTraits: boolean) => blankTraits)
    //             ? []
    //             : this.traits
    //     );

    //     for (const gainedTrait of this.getEffects(EffectNames.AddTrait)) {
    //         set.add(gainedTrait);
    //     }
    //     for (const lostTrait of this.getEffects(EffectNames.LoseTrait)) {
    //         set.delete(lostTrait);
    //     }

    //     return set;
    // }

    // isFaction(faction: Faction): boolean {
    //     const copyEffect = this.mostRecentEffect(EffectNames.CopyCharacter);
    //     const cardFaction = copyEffect ? copyEffect.printedFaction : this.printedFaction;
    //     if (faction === 'neutral') {
    //         return cardFaction === faction && !this.anyEffect(EffectNames.AddFaction);
    //     }
    //     return cardFaction === faction || this.getEffects(EffectNames.AddFaction).includes(faction);
    // }

    // isInPlay(): boolean {
    //     if (this.isFacedown()) {
    //         return false;
    //     }
    //     if ([CardTypes.Holding, CardTypes.Province, CardTypes.Stronghold].includes(this.type)) {
    //         return this.isInProvince();
    //     }
    //     return this.location === Locations.PlayArea;
    // }

    // applyAnyLocationPersistentEffects(): void {
    //     for (const effect of this.persistentEffects) {
    //         if (effect.location === Locations.Any) {
    //             effect.ref = this.addEffectToEngine(effect);
    //         }
    //     }
    // }

    leavesPlay(destination?: Locations): void {
        this.tokens = {};
        this.#resetLimits();
        this.controller = this.owner;
    }

    #resetLimits() {
        for (const action of this.abilities.actions) {
            action.limit.reset();
        }
        for (const reaction of this.abilities.reactions) {
            reaction.limit.reset();
        }
    }

    // updateAbilityEvents(from: Locations, to: Locations, reset: boolean = true) {
    //     if (reset) {
    //         this.#resetLimits();
    //     }
    //     for (const reaction of this.reactions) {
    //         if (this.type === CardTypes.Event) {
    //             if (
    //                 to === Locations.ConflictDeck ||
    //                 this.controller.isCardInPlayableLocation(this) ||
    //                 (this.controller.opponent && this.controller.opponent.isCardInPlayableLocation(this))
    //             ) {
    //                 reaction.registerEvents();
    //             } else {
    //                 reaction.unregisterEvents();
    //             }
    //         } else if (reaction.location.includes(to) && !reaction.location.includes(from)) {
    //             reaction.registerEvents();
    //         } else if (!reaction.location.includes(to) && reaction.location.includes(from)) {
    //             reaction.unregisterEvents();
    //         }
    //     }
    // }

    // updateEffects(from: Locations, to: Locations) {
    //     const activeLocations = {
    //         'conflict discard pile': [Locations.ConflictDiscardPile],
    //         'play area': [Locations.PlayArea],
    //         province: this.game.getProvinceArray()
    //     };
    //     if (
    //         !activeLocations[Locations.Provinces].includes(from) ||
    //         !activeLocations[Locations.Provinces].includes(to)
    //     ) {
    //         this.removeLastingEffects();
    //     }
    //     this.updateStatusTokenEffects();
    //     for (const effect of this.persistentEffects) {
    //         if (effect.location === Locations.Any) {
    //             continue;
    //         }
    //         if (activeLocations[effect.location].includes(to) && !activeLocations[effect.location].includes(from)) {
    //             effect.ref = this.addEffectToEngine(effect);
    //         } else if (
    //             !activeLocations[effect.location].includes(to) &&
    //             activeLocations[effect.location].includes(from)
    //         ) {
    //             this.removeEffectFromEngine(effect.ref);
    //             effect.ref = [];
    //         }
    //     }
    // }

    updateEffectContexts() {
        for (const effect of this.persistentEffects) {
            if (effect.ref) {
                for (let e of effect.ref) {
                    e.refreshContext();
                }
            }
        }
    }

    moveTo(targetLocation: Locations) {
        let originalLocation = this.location;
        let sameLocation = false;

        this.location = targetLocation;

        if (
            cardLocationMatches(
                targetLocation,
                [WildcardLocations.AnyArena, Locations.Discard, Locations.Hand]
            )
        ) {
            this.facedown = false;
        }

        if (originalLocation !== targetLocation) {
            // this.updateAbilityEvents(originalLocation, targetLocation, !sameLocation);
            // this.updateEffects(originalLocation, targetLocation);
            this.game.emitEvent(EventNames.OnCardMoved, {
                card: this,
                originalLocation: originalLocation,
                newLocation: targetLocation
            });
        }
    }

    canTriggerAbilities(context: AbilityContext, ignoredRequirements = []): boolean {
        return (
            this.isFaceup() &&
            (ignoredRequirements.includes('triggeringRestrictions') ||
                this.checkRestrictions('triggerAbilities', context))
        );
    }

    canInitiateKeywords(context: AbilityContext): boolean {
        return this.isFaceup() && this.checkRestrictions('initiateKeywords', context);
    }

    // getModifiedLimitMax(player: Player, ability: CardAbility, max: number): number {
    //     const effects = this.getRawEffects().filter((effect) => effect.type === EffectNames.IncreaseLimitOnAbilities);
    //     let total = max;
    //     effects.forEach((effect) => {
    //         const value = effect.getValue(this);
    //         const applyingPlayer = value.applyingPlayer || effect.context.player;
    //         const targetAbility = value.targetAbility;
    //         if ((!targetAbility || targetAbility === ability) && applyingPlayer === player) {
    //             total++;
    //         }
    //     });

    //     const printedEffects = this.getRawEffects().filter(
    //         (effect) => effect.type === EffectNames.IncreaseLimitOnPrintedAbilities
    //     );
    //     printedEffects.forEach((effect) => {
    //         const value = effect.getValue(this);
    //         if (ability.printedAbility && (value === true || value === ability) && effect.context.player === player) {
    //             total++;
    //         }
    //     });

    //     return total;
    // }

    // getMenu() {
    //     if (
    //         this.menu.length === 0 ||
    //         !this.game.manualMode ||
    //         ![...this.game.getProvinceArray(), Locations.PlayArea].includes(this.location)
    //     ) {
    //         return undefined;
    //     }

    //     if (this.isFacedown()) {
    //         return [
    //             { command: 'click', text: 'Select Card' },
    //             { command: 'reveal', text: 'Reveal' }
    //         ];
    //     }

    //     const menu = [{ command: 'click', text: 'Select Card' }];
    //     if (this.location === Locations.PlayArea || this.isProvince || this.isBase) {
    //         menu.push(...this.menu);
    //     }
    //     return menu;
    // }

    isAttacking(conflictType?: 'military' | 'political'): boolean {
        return (
            this.game.currentConflict?.isAttacking(this) && (!conflictType || this.game.isDuringConflict(conflictType))
        );
    }

    isDefending(conflictType?: 'military' | 'political'): boolean {
        return (
            this.game.currentConflict?.isDefending(this) && (!conflictType || this.game.isDuringConflict(conflictType))
        );
    }

    isParticipatingFor(player: Player): boolean {
        return (this.isAttacking() && player.isAttackingPlayer()) || (this.isDefending() && player.isDefendingPlayer());
    }

    isUnique(): boolean {
        return this.cardData.is_unique;
    }

    isBlank(): boolean {
        return this.anyEffect(EffectNames.Blank);
    }

    getPrintedFaction(): string {
        return this.cardData.clan || this.cardData.faction;
    }

    checkRestrictions(actionType, context: AbilityContext): boolean {
        let player = (context && context.player) || this.controller;
        let conflict = context && context.game && context.game.currentConflict;
        return (
            super.checkRestrictions(actionType, context) &&
            player.checkRestrictions(actionType, context) &&
            (!conflict || conflict.checkRestrictions(actionType, context))
        );
    }

    getTokenCount(type: string): number {
        return this.tokens[type] ?? 0;
    }

    addToken(type: string, number: number = 1): void {
        this.tokens[type] = this.getTokenCount(type) + number;
    }

    hasToken(type: string): boolean {
        return this.getTokenCount(type) > 0;
    }

    removeAllTokens(): void {
        let keys = Object.keys(this.tokens);
        keys.forEach((key) => this.removeToken(key, this.tokens[key]));
    }

    removeToken(type: string, number: number): void {
        this.tokens[type] -= number;

        if (this.tokens[type] < 0) {
            this.tokens[type] = 0;
        }

        if (this.tokens[type] === 0) {
            delete this.tokens[type];
        }
    }

    getActions(): any[] {
        return this.actions.slice();
    }

    getReactions(): any[] {
        return this.reactions.slice();
    }

    readiesDuringReadyPhase(): boolean {
        return !this.anyEffect(EffectNames.DoesNotReady);
    }

    // hideWhenFacedown(): boolean {
    //     return !this.anyEffect(EffectNames.CanBeSeenWhenFacedown);
    // }

    createSnapshot() {
        return {};
    }

    parseKeywords(text: string) {
        const potentialKeywords = [];
        for (const line of text.split('\n')) {
            for (const k of line.slice(0, -1).split('.')) {
                potentialKeywords.push(k.trim());
            }
        }

        for (const keyword of potentialKeywords) {
            if (ValidKeywords.has(keyword)) {
                this.printedKeywords.push(keyword);
            } else if (keyword.startsWith('disguised ')) {
                this.disguisedKeywordTraits.push(keyword.replace('disguised ', ''));
            } else if (keyword.startsWith('no attachments except')) {
                var traits = keyword.replace('no attachments except ', '');
                this.allowedAttachmentTraits = traits.split(' or ');
            } else if (keyword.startsWith('no attachments,')) {
                //catch all for statements that are to hard to parse automatically
            } else if (keyword.startsWith('no attachments')) {
                this.allowedAttachmentTraits = ['none'];
            }
        }

        // TODO: uncomment
        // for (const keyword of this.printedKeywords) {
        //     this.persistentEffect({ effect: AbilityDsl.effects.addKeyword(keyword) });
        // }
    }

    // isAttachmentBonusModifierSwitchActive() {
    //     const switches = this.getEffects(EffectNames.SwitchAttachmentSkillModifiers).filter(Boolean);
    //     // each pair of switches cancels each other. Need an odd number of switches to be active
    //     return switches.length % 2 === 1;
    // }

    // applyAttachmentBonus() {
    //     const militaryBonus = parseInt(this.cardData.military_bonus);
    //     const politicalBonus = parseInt(this.cardData.political_bonus);
    //     if (!isNaN(militaryBonus)) {
    //         this.persistentEffect({
    //             match: (card) => card === this.parent,
    //             targetController: Players.Any,
    //             effect: AbilityDsl.effects.attachmentMilitarySkillModifier(() =>
    //                 this.isAttachmentBonusModifierSwitchActive() ? politicalBonus : militaryBonus
    //             )
    //         });
    //     }
    //     if (!isNaN(politicalBonus)) {
    //         this.persistentEffect({
    //             match: (card) => card === this.parent,
    //             targetController: Players.Any,
    //             effect: AbilityDsl.effects.attachmentPoliticalSkillModifier(() =>
    //                 this.isAttachmentBonusModifierSwitchActive() ? militaryBonus : politicalBonus
    //             )
    //         });
    //     }
    // }

    // checkForIllegalAttachments() {
    //     let context = this.game.getFrameworkContext(this.controller);
    //     const illegalAttachments = new Set(
    //         this.upgrades.filter((attachment) => !this.allowAttachment(attachment) || !attachment.canAttach(this))
    //     );
    //     for (const effectCard of this.getEffects(EffectNames.CannotHaveOtherRestrictedAttachments)) {
    //         for (const card of this.upgrades) {
    //             if (card.isRestricted() && card !== effectCard) {
    //                 illegalAttachments.add(card);
    //             }
    //         }
    //     }

    //     const attachmentLimits = this.upgrades.filter((card) => card.anyEffect(EffectNames.AttachmentLimit));
    //     for (const card of attachmentLimits) {
    //         let limit = Math.max(...card.getEffects(EffectNames.AttachmentLimit));
    //         const matchingAttachments = this.upgrades.filter((attachment) => attachment.id === card.id);
    //         for (const card of matchingAttachments.slice(0, -limit)) {
    //             illegalAttachments.add(card);
    //         }
    //     }

    //     const frameworkLimitsAttachmentsWithRepeatedNames =
    //         this.game.gameMode === GameModes.Emerald || this.game.gameMode === GameModes.Obsidian;
    //     if (frameworkLimitsAttachmentsWithRepeatedNames) {
    //         for (const card of this.upgrades) {
    //             const matchingAttachments = this.upgrades.filter(
    //                 (attachment) =>
    //                     !attachment.allowDuplicatesOfAttachment &&
    //                     attachment.id === card.id &&
    //                     attachment.controller === card.controller
    //             );
    //             for (const card of matchingAttachments.slice(0, -1)) {
    //                 illegalAttachments.add(card);
    //             }
    //         }
    //     }

    //     for (const object of this.upgrades.reduce(
    //         (array, card) => array.concat(card.getEffects(EffectNames.AttachmentRestrictTraitAmount)),
    //         []
    //     )) {
    //         for (const trait of Object.keys(object)) {
    //             const matchingAttachments = this.upgrades.filter((attachment) => attachment.hasTrait(trait));
    //             for (const card of matchingAttachments.slice(0, -object[trait])) {
    //                 illegalAttachments.add(card);
    //             }
    //         }
    //     }
    //     let maximumRestricted = 2 + this.sumEffects(EffectNames.ModifyRestrictedAttachmentAmount);
    //     if (this.upgrades.filter((card) => card.isRestricted()).length > maximumRestricted) {
    //         this.game.promptForSelect(this.controller, {
    //             activePromptTitle: 'Choose an attachment to discard',
    //             waitingPromptTitle: 'Waiting for opponent to choose an attachment to discard',
    //             cardCondition: (card) => card.parent === this && card.isRestricted(),
    //             onSelect: (player, card) => {
    //                 this.game.addMessage(
    //                     '{0} discards {1} from {2} due to too many Restricted attachments',
    //                     player,
    //                     card,
    //                     card.parent
    //                 );

    //                 if (illegalAttachments.size > 0) {
    //                     this.game.addMessage(
    //                         '{0} {1} discarded from {3} as {2} {1} no longer legally attached',
    //                         Array.from(illegalAttachments),
    //                         illegalAttachments.size > 1 ? 'are' : 'is',
    //                         illegalAttachments.size > 1 ? 'they' : 'it',
    //                         this
    //                     );
    //                 }

    //                 illegalAttachments.add(card);
    //                 this.game.applyGameAction(context, { discardFromPlay: Array.from(illegalAttachments) });
    //                 return true;
    //             },
    //             source: 'Too many Restricted attachments'
    //         });
    //         return true;
    //     } else if (illegalAttachments.size > 0) {
    //         this.game.addMessage(
    //             '{0} {1} discarded from {3} as {2} {1} no longer legally attached',
    //             Array.from(illegalAttachments),
    //             illegalAttachments.size > 1 ? 'are' : 'is',
    //             illegalAttachments.size > 1 ? 'they' : 'it',
    //             this
    //         );
    //         this.game.applyGameAction(context, { discardFromPlay: Array.from(illegalAttachments) });
    //         return true;
    //     }
    //     return false;
    // }

    /**
     * Checks whether an attachment can be played on a given card.  Intended to be
     * used by cards inheriting this class
     */
    canPlayOn(card) {
        // eslint-disable-line no-unused-vars
        return true;
    }

    /**
     * Checks 'no attachment' restrictions for this card when attempting to
     * attach the passed attachment card.
     */
    allowAttachment(attachment) {
        if (this.allowedAttachmentTraits.some((trait) => attachment.hasTrait(trait))) {
            return true;
        }

        return this.isBlank() || this.allowedAttachmentTraits.length === 0;
    }

    // /**
    //  * Applies an effect with the specified properties while the current card is
    //  * attached to another card. By default the effect will target the parent
    //  * card, but you can provide a match function to narrow down whether the
    //  * effect is applied (for cases where the effect only applies to specific
    //  * characters).
    //  */
    // whileAttached(properties: Pick<PersistentEffectProps<this>, 'condition' | 'match' | 'effect'>) {
    //     this.persistentEffect({
    //         condition: properties.condition || (() => true),
    //         match: (card, context) => card === this.parent && (!properties.match || properties.match(card, context)),
    //         targetController: Players.Any,
    //         effect: properties.effect
    //     });
    // }

    // /**
    //  * Checks whether the passed card meets the attachment restrictions (e.g.
    //  * Opponent cards only, specific factions, etc) for this card.
    //  */
    // canAttach(parent?: BaseCard, properties = { ignoreType: false, controller: this.controller }) {
    //     if (!(parent instanceof BaseCard)) {
    //         return false;
    //     }

    //     if (
    //         parent.getType() !== CardTypes.Character ||
    //         (!properties.ignoreType && this.getType() !== CardTypes.Attachment)
    //     ) {
    //         return false;
    //     }

    //     const attachmentController = properties.controller ?? this.controller;
    //     for (const effect of this.getRawEffects() as CardEffect[]) {
    //         switch (effect.type) {
    //             case EffectNames.AttachmentMyControlOnly: {
    //                 if (attachmentController !== parent.controller) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectNames.AttachmentOpponentControlOnly: {
    //                 if (attachmentController === parent.controller) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectNames.AttachmentUniqueRestriction: {
    //                 if (!parent.isUnique()) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectNames.AttachmentFactionRestriction: {
    //                 const factions = effect.getValue<Faction[]>(this as any);
    //                 if (!factions.some((faction) => parent.isFaction(faction))) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectNames.AttachmentTraitRestriction: {
    //                 const traits = effect.getValue<string[]>(this as any);
    //                 if (!traits.some((trait) => parent.hasTrait(trait))) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectNames.AttachmentCardCondition: {
    //                 const cardCondition = effect.getValue<(card: BaseCard) => boolean>(this as any);
    //                 if (!cardCondition(parent)) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //         }
    //     }
    //     return true;
    // }

    getPlayActions() {
        if (this.type === CardTypes.Event) {
            return this.getActions();
        }
        let actions = this.abilities.playActions.slice();
        if (this.type === CardTypes.Unit) {
            actions.push(new PlayUnitAction(this));
        } 
        // else if (this.type === CardTypes.Upgrade) {
        //     actions.push(new PlayAttachmentAction(this));
        // }
        return actions;
    }

    /**
     * This removes an attachment from this card's attachment Array.  It doesn't open any windows for
     * game effects to respond to.
     * @param {DeckCard} attachment
     */
    removeAttachment(attachment) {
        this.upgrades = this.upgrades.filter((card) => card.uuid !== attachment.uuid);
    }

    addChildCard(card, location) {
        this.childCards.push(card);
        this.controller.moveCard(card, location);
    }

    removeChildCard(card, location) {
        if (!card) {
            return;
        }

        this.childCards = this.childCards.filter((a) => a !== card);
        this.controller.moveCard(card, location);
    }

    // addStatusToken(tokenType) {
    //     tokenType = tokenType.grantedStatus || tokenType;
    //     if (!this.statusTokens.find((a) => a.grantedStatus === tokenType)) {
    //         if (tokenType === CharacterStatus.Honored && this.isDishonored) {
    //             this.removeStatusToken(CharacterStatus.Dishonored);
    //         } else if (tokenType === CharacterStatus.Dishonored && this.isHonored) {
    //             this.removeStatusToken(CharacterStatus.Honored);
    //         } else {
    //             const token = StatusToken.create(this.game, this, tokenType);
    //             if (token) {
    //                 token.setCard(this);
    //                 this.statusTokens.push(token);
    //             }
    //         }
    //     }
    // }

    removeStatusToken(tokenType) {
        tokenType = tokenType.grantedStatus || tokenType;
        const index = this.statusTokens.findIndex((a) => a.grantedStatus === tokenType);
        if (index > -1) {
            const realToken = this.statusTokens[index];
            realToken.setCard(null);
            this.statusTokens.splice(index, 1);
        }
    }

    getStatusToken(tokenType) {
        return this.statusTokens.find((a) => a.grantedStatus === tokenType);
    }

    get hasStatusTokens() {
        return !!this.statusTokens && this.statusTokens.length > 0;
    }

    hasStatusToken(type) {
        return !!this.statusTokens && this.statusTokens.some((a) => a.grantedStatus === type);
    }

    public getShortSummaryForControls(activePlayer: Player) {
        if (this.isFacedown() && (activePlayer !== this.controller || this.hideWhenFacedown())) {
            return { facedown: true, isDynasty: this.isDynasty, isConflict: this.isConflict };
        }
        return super.getShortSummaryForControls(activePlayer);
    }

    public isFacedown() {
        return this.facedown;
    }

    public isFaceup() {
        return !this.facedown;
    }

    public isResource() {
        return this.resourced;
    }

    // getSummary(activePlayer, hideWhenFaceup) {
    //     let isActivePlayer = activePlayer === this.controller;
    //     let selectionState = activePlayer.getCardSelectionState(this);

    //     // This is my facedown card, but I'm not allowed to look at it
    //     // OR This is not my card, and it's either facedown or hidden from me
    //     if (
    //         isActivePlayer
    //             ? this.isFacedown() && this.hideWhenFacedown()
    //             : this.isFacedown() || hideWhenFaceup || this.anyEffect(EffectNames.HideWhenFaceUp)
    //     ) {
    //         let state = {
    //             controller: this.controller.getShortSummary(),
    //             menu: isActivePlayer ? this.getMenu() : undefined,
    //             facedown: true,
    //             inConflict: this.inConflict,
    //             location: this.location,
    //             uuid: isActivePlayer ? this.uuid : undefined
    //         };
    //         return Object.assign(state, selectionState);
    //     }

    //     let state = {
    //         id: this.cardData.id,
    //         controlled: this.owner !== this.controller,
    //         inConflict: this.inConflict,
    //         facedown: this.isFacedown(),
    //         location: this.location,
    //         menu: this.getMenu(),
    //         name: this.cardData.name,
    //         popupMenuText: this.popupMenuText,
    //         showPopup: this.showPopup,
    //         tokens: this.tokens,
    //         type: this.getType(),
    //         isDishonored: this.isDishonored,
    //         isHonored: this.isHonored,
    //         isTainted: !!this.isTainted,
    //         uuid: this.uuid
    //     };

    //     return Object.assign(state, selectionState);
    // }
}

export = BaseCard;