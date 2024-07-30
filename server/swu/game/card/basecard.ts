const AbilityDsl = require('../abilitydsl.js');
const Effects = require('../effects/effects');
const EffectSource = require('../EffectSource.js');
import CardAbility = require('../CardTextAbility');
// import TriggeredAbility = require('./triggeredability');
import Game = require('../game.js');

import { GameModes } from '../../GameModes.js';
import { AbilityContext } from '../AbilityContext.js';
import { CardTextAction } from '../CardTextAction.js';
import { AttackAction } from '../gameActions/AttackAction';
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
    WildcardLocations,
    StatType
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
import StatModifier = require('../StatModifier');
import type { CardEffect } from '../effects/types';
// import type { GainAllAbilities } from './Effects/Library/gainAllAbilities';
import { PlayUnitAction } from '../gameActions/PlayUnitAction.js';
import { checkConvertToEnum } from '../utils/helpers';

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
// TODO: switch to using mixins for the different card types
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

    menu = [
        { command: 'exhaust', text: 'Exhaust/Ready' },
        { command: 'control', text: 'Give control' }
    ];

    tokens: object = {};
    // menu: { command: string; text: string }[] = [];

    showPopup: boolean = false;
    popupMenuText: string = '';
    abilities: any = { actions: [], reactions: [], persistentEffects: [], playActions: [] };
    traits: string[];
    printedFaction: string;
    location: Locations;

    isBase: boolean = false;
    isLeader: boolean = false;

    upgrades = [] as BaseCard[];
    childCards = [] as BaseCard[];
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
        this.printedType = checkConvertToEnum([cardData.type], CardTypes)[0]; // TODO: does this work for leader consistently, since it has two types?
        this.traits = cardData.traits;  // TODO: enum for these
        this.aspects = checkConvertToEnum(cardData.aspects, Aspects);
        this.printedKeywords = cardData.keywords;   // TODO: enum for these

        this.setupCardAbilities(AbilityDsl);
        // this.parseKeywords(cardData.text ? cardData.text.replace(/<[^>]*>/g, '').toLowerCase() : '');
        // this.applyAttachmentBonus();

        if (this.type === CardTypes.Unit) {
            this.abilities.actions.push(AbilityDsl.attack());
        }





        // *************************** DECKCARD.JS CONSTRUCTOR ******************************

        this.defaultController = owner;
        this.parent = null;
        this.printedHp = this.getPrintedStat(StatType.Hp);
        this.printedPower = this.getPrintedStat(StatType.Power);
        this.printedCost = parseInt(this.cardData.cost);
        this.exhausted = false;
        this.damage = 0;

        switch (cardData.arena) {
            case "space":
                this.defaultArena = Locations.SpaceArena;
                break;
            case "ground":
                this.defaultArena = Locations.GroundArena;
                break;
            default:
                this.defaultArena = null;
        }

        // if (cardData.type === CardTypes.Character) {
        //     this.abilities.reactions.push(new CourtesyAbility(this.game, this));
        //     this.abilities.reactions.push(new PrideAbility(this.game, this));
        //     this.abilities.reactions.push(new SincerityAbility(this.game, this));
        // }
        // if (cardData.type === CardTypes.Attachment) {
        //     this.abilities.reactions.push(new CourtesyAbility(this.game, this));
        //     this.abilities.reactions.push(new SincerityAbility(this.game, this));
        // }
        // if (cardData.type === CardTypes.Event && this.hasEphemeral()) {
        //     this.eventRegistrarForEphemeral = new EventRegistrar(this.game, this);
        //     this.eventRegistrarForEphemeral.register([{ [EventNames.OnCardPlayed]: 'handleEphemeral' }]);
        // }
        // if (this.isDynasty) {
        //     this.abilities.reactions.push(new RallyAbility(this.game, this));
        // }
    }

    get name(): string {
        let copyEffect = this.mostRecentEffect(EffectNames.CopyCharacter);
        return copyEffect ? copyEffect.printedName : this.printedTitle;
    }

    set name(name: string) {
        this.printedTitle = name;
    }

    #mostRecentEffect(predicate: (effect: CardEffect) => boolean): CardEffect | undefined {
        const effects = this.getRawEffects().filter(predicate);
        return effects[effects.length - 1];
    }

    #getActions(ignoreDynamicGains = false): CardTextAction[] {
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

    get actions(): CardTextAction[] {
        return this.#getActions();
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

    createAction(properties: ActionProps): CardTextAction {
        return new CardTextAction(this.game, this, properties);
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

    // TODO: would something like this be helpful for swu?
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
     * @param {BaseCard} attachment
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

    // --------------------------- TODO: type annotations for all of the below --------------------------

    // this will be helpful if we ever get a card where a stat that is "X, where X is ..."
    getPrintedStat(type: StatType) {
        if (type === StatType.Power) {
            return this.cardData.power === null || this.cardData.power === undefined
                ? NaN
                : isNaN(parseInt(this.cardData.power))
                ? 0
                : parseInt(this.cardData.power);
        } else if (type === StatType.Hp) {
            return this.cardData.hp === null || this.cardData.hp === undefined
                ? NaN
                : isNaN(parseInt(this.cardData.hp))
                ? 0
                : parseInt(this.cardData.hp);
        }
    }

    addDamage(amount: number) {
        if (isNaN(this.hp) || amount === 0) {
            return;
        }

        this.damage += amount;
        // UP NEXT: add a check for if the card is destroyed
    }

    // TODO: type annotations for all of the hp stuff
    get hp(): number | null {
        return this.getHp();
    }

    getHp(floor = true, excludeModifiers = []): number | null {
        if (this.printedHp === null) {
            return null;
        }

        let modifiers = this.getHpModifiers(excludeModifiers);
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return floor ? Math.max(0, skill) : skill;
    }

    get baseHp(): number {
        return this.getBaseHp();
    }

    getBaseHp(): number {
        let skill = this.getBaseStatModifiers().baseHp;
        if (isNaN(skill)) {
            return 0;
        }
        return Math.max(0, skill);
    }

    getHpModifiers(exclusions) {
        let baseStatModifiers = this.getBaseStatModifiers();
        if (isNaN(baseStatModifiers.baseHp)) {
            return baseStatModifiers.baseHpModifiers;
        }

        if (!exclusions) {
            exclusions = [];
        }

        let rawEffects;
        if (typeof exclusions === 'function') {
            rawEffects = this.getRawEffects().filter((effect) => !exclusions(effect));
        } else {
            rawEffects = this.getRawEffects().filter((effect) => !exclusions.includes(effect.type));
        }

        let modifiers = baseStatModifiers.baseHpModifiers;

        // hp modifiers
        // TODO: remove status tokens completely, upgrades completely cover that category
        let modifierEffects = rawEffects.filter(
            (effect) =>
                effect.type === EffectNames.UpgradeHpModifier ||
                effect.type === EffectNames.ModifyHp
        );
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            modifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });

        return modifiers;
    }

    get power() {
        return this.getPower();
    }

    getPower(floor = true, excludeModifiers = []) {
        let modifiers = this.getPowerModifiers(excludeModifiers);
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return floor ? Math.max(0, skill) : skill;
    }

    get basePower() {
        return this.getBasePower();
    }

    getBasePower() {
        let skill = this.getBaseStatModifiers().basePower;
        if (isNaN(skill)) {
            return 0;
        }
        return Math.max(0, skill);
    }

    getPowerModifiers(exclusions) {
        let baseStatModifiers = this.getBaseStatModifiers();
        if (isNaN(baseStatModifiers.basePower)) {
            return baseStatModifiers.basePowerModifiers;
        }

        if (!exclusions) {
            exclusions = [];
        }

        let rawEffects;
        if (typeof exclusions === 'function') {
            rawEffects = this.getRawEffects().filter((effect) => !exclusions(effect));
        } else {
            rawEffects = this.getRawEffects().filter((effect) => !exclusions.includes(effect.type));
        }

        // set effects (i.e., "set power to X")
        let setEffects = rawEffects.filter(
            (effect) => effect.type === EffectNames.SetPower
        );
        if (setEffects.length > 0) {
            let latestSetEffect = _.last(setEffects);
            let setAmount = latestSetEffect.getValue(this);
            return [
                StatModifier.fromEffect(
                    setAmount,
                    latestSetEffect,
                    true,
                    `Set by ${StatModifier.getEffectName(latestSetEffect)}`
                )
            ];
        }

        let modifiers = baseStatModifiers.basePowerModifiers;

        // power modifiers
        // TODO: remove status tokens completely, upgrades completely cover that category
        // TODO: does this work for resolving effects like Raid that depend on whether we're the attacker or not?
        let modifierEffects = rawEffects.filter(
            (effect) =>
                effect.type === EffectNames.UpgradePowerModifier ||
                effect.type === EffectNames.ModifyPower ||
                effect.type === EffectNames.ModifyStats
        );
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            modifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });

        return modifiers;
    }

    /**
     * Direct the stat query to the correct sub function.
     * @param  {string} type - The type of the stat; power or hp
     * @return {number} The chosen stat value
     */
    getStat(type) {
        switch (type) {
            case StatType.Power:
                return this.getPower();
            case StatType.Hp:
                return this.getHp();
        }
    }

    // TODO: rename this to something clearer
    /**
     * Apply any modifiers that explicitly say they change the base skill value
     */ 
    getBaseStatModifiers() {
        const baseModifierEffects = [
            EffectNames.CopyCharacter,
            EffectNames.CalculatePrintedPower,
            EffectNames.SetBasePower,
        ];

        let baseEffects = this.getRawEffects().filter((effect) => baseModifierEffects.includes(effect.type));
        let basePowerModifiers = [StatModifier.fromCard(this.printedPower, this, 'Printed power', false)];
        let baseHpModifiers = [StatModifier.fromCard(this.printedHp, this, 'Printed hp', false)];
        let basePower = this.printedPower;
        let baseHp = this.printedHp;

        baseEffects.forEach((effect) => {
            switch (effect.type) {
                // this case is for cards that don't have a default printed power but it is instead calculated
                case EffectNames.CalculatePrintedPower: {
                    let powerFunction = effect.getValue(this);
                    let calculatedPowerValue = powerFunction(this);
                    basePower = calculatedPowerValue;
                    basePowerModifiers = basePowerModifiers.filter(
                        (mod) => !mod.name.startsWith('Printed power')
                    );
                    basePowerModifiers.push(
                        StatModifier.fromEffect(
                            basePower,
                            effect,
                            false,
                            `Printed power due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                }
                case EffectNames.CopyCharacter: {
                    let copiedCard = effect.getValue(this);
                    basePower = copiedCard.getPrintedStat(StatType.Power);
                    baseHp = copiedCard.getPrintedStat(StatType.Hp);
                    // replace existing base or copied modifier
                    basePowerModifiers = basePowerModifiers.filter(
                        (mod) => !mod.name.startsWith('Printed stat')
                    );
                    baseHpModifiers = baseHpModifiers.filter(
                        (mod) => !mod.name.startsWith('Printed stat')
                    );
                    basePowerModifiers.push(
                        StatModifier.fromEffect(
                            basePower,
                            effect,
                            false,
                            `Printed skill from ${copiedCard.name} due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    baseHpModifiers.push(
                        StatModifier.fromEffect(
                            baseHp,
                            effect,
                            false,
                            `Printed skill from ${copiedCard.name} due to ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
                }
                case EffectNames.SetBasePower:
                    basePower = effect.getValue(this);
                    basePowerModifiers.push(
                        StatModifier.fromEffect(
                            basePower,
                            effect,
                            true,
                            `Base power set by ${StatModifier.getEffectName(effect)}`
                        )
                    );
                    break;
            }
        });

        let overridingPowerModifiers = basePowerModifiers.filter((mod) => mod.overrides);
        if (overridingPowerModifiers.length > 0) {
            let lastModifier = _.last(overridingPowerModifiers);
            basePowerModifiers = [lastModifier];
            basePower = lastModifier.amount;
        }
        let overridingHpModifiers = baseHpModifiers.filter((mod) => mod.overrides);
        if (overridingHpModifiers.length > 0) {
            let lastModifier = _.last(overridingHpModifiers);
            baseHpModifiers = [lastModifier];
            baseHp = lastModifier.amount;
        }

        return {
            basePowerModifiers: basePowerModifiers,
            basePower: basePower,
            baseHpModifiers: baseHpModifiers,
            baseHp: baseHp
        };
    }

















    // *******************************************************************************************************
    // ************************************** DECKCARD.JS ****************************************************
    // *******************************************************************************************************

    getCost() {
        let copyEffect = this.mostRecentEffect(EffectNames.CopyCharacter);
        return copyEffect ? copyEffect.printedCost : this.printedCost;
    }

    costLessThan(num) {
        let cost = this.printedCost;
        return num && (cost || cost === 0) && cost < num;
    }

    anotherUniqueInPlay(player) {
        return (
            this.isUnique() &&
            this.game.allCards.any(
                (card) =>
                    card.isInPlay() &&
                    card.printedName === this.printedTitle &&   // TODO: also check subtitle
                    card !== this &&
                    (card.owner === player || card.controller === player || card.owner === this.owner)
            )
        );
    }

    anotherUniqueInPlayControlledBy(player) {
        return (
            this.isUnique() &&
            this.game.allCards.any(
                (card) =>
                    card.isInPlay() &&
                    card.printedName === this.printedTitle &&
                    card !== this &&
                    card.controller === player
            )
        );
    }

    createSnapshot() {
        let clone = new BaseCard(this.owner, this.cardData);

        // clone.upgrades = _(this.upgrades.map((attachment) => attachment.createSnapshot()));
        clone.childCards = this.childCards.map((card) => card.createSnapshot());
        clone.effects = _.clone(this.effects);
        clone.controller = this.controller;
        clone.exhausted = this.exhausted;
        // clone.statusTokens = [...this.statusTokens];
        clone.location = this.location;
        clone.parent = this.parent;
        clone.aspects = _.clone(this.aspects);
        // clone.fate = this.fate;
        // clone.inConflict = this.inConflict;
        clone.traits = Array.from(this.getTraits());
        clone.uuid = this.uuid;
        return clone;
    }

    // hasDash(type = '') {
    //     if (type === 'glory' || this.printedType !== CardTypes.Character) {
    //         return false;
    //     }

    //     let baseSkillModifiers = this.getBaseSkillModifiers();

    //     if (type === 'military') {
    //         return isNaN(baseSkillModifiers.baseMilitarySkill);
    //     } else if (type === 'political') {
    //         return isNaN(baseSkillModifiers.basePoliticalSkill);
    //     }

    //     return isNaN(baseSkillModifiers.baseMilitarySkill) || isNaN(baseSkillModifiers.basePoliticalSkill);
    // }

    // getContributionToConflict(type) {
    //     let skillFunction = this.mostRecentEffect(EffectNames.ChangeContributionFunction);
    //     if (skillFunction) {
    //         return skillFunction(this);
    //     }
    //     return this.getSkill(type);
    // }

    getStatusTokenSkill() {
        let modifiers = this.getStatusTokenModifiers();
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        if (isNaN(skill)) {
            return 0;
        }
        return skill;
    }

    // getStatusTokenModifiers() {
    //     let modifiers = [];
    //     let modifierEffects = this.getRawEffects().filter((effect) => effect.type === EffectNames.ModifyBothSkills);

    //     // skill modifiers
    //     modifierEffects.forEach((modifierEffect) => {
    //         const value = modifierEffect.getValue(this);
    //         modifiers.push(StatModifier.fromEffect(value, modifierEffect));
    //     });
    //     modifiers = modifiers.filter((modifier) => modifier.type === 'token');

    //     // adjust honor status effects
    //     this.adjustHonorStatusModifiers(modifiers);
    //     return modifiers;
    // }

    // getMilitaryModifiers(exclusions) {
    //     let baseSkillModifiers = this.getBaseSkillModifiers();
    //     if (isNaN(baseSkillModifiers.baseMilitarySkill)) {
    //         return baseSkillModifiers.baseMilitaryModifiers;
    //     }

    //     if (!exclusions) {
    //         exclusions = [];
    //     }

    //     let rawEffects;
    //     if (typeof exclusions === 'function') {
    //         rawEffects = this.getRawEffects().filter((effect) => !exclusions(effect));
    //     } else {
    //         rawEffects = this.getRawEffects().filter((effect) => !exclusions.includes(effect.type));
    //     }

    //     // set effects
    //     let setEffects = rawEffects.filter(
    //         (effect) => effect.type === EffectNames.SetMilitarySkill || effect.type === EffectNames.SetDash
    //     );
    //     if (setEffects.length > 0) {
    //         let latestSetEffect = _.last(setEffects);
    //         let setAmount = latestSetEffect.type === EffectNames.SetDash ? undefined : latestSetEffect.getValue(this);
    //         return [
    //             StatModifier.fromEffect(
    //                 setAmount,
    //                 latestSetEffect,
    //                 true,
    //                 `Set by ${StatModifier.getEffectName(latestSetEffect)}`
    //             )
    //         ];
    //     }

    //     let modifiers = baseSkillModifiers.baseMilitaryModifiers;

    //     // skill modifiers
    //     let modifierEffects = rawEffects.filter(
    //         (effect) =>
    //             effect.type === EffectNames.AttachmentMilitarySkillModifier ||
    //             effect.type === EffectNames.ModifyMilitarySkill ||
    //             effect.type === EffectNames.ModifyBothSkills
    //     );
    //     modifierEffects.forEach((modifierEffect) => {
    //         const value = modifierEffect.getValue(this);
    //         modifiers.push(StatModifier.fromEffect(value, modifierEffect));
    //     });

    //     // adjust honor status effects
    //     this.adjustHonorStatusModifiers(modifiers);

    //     // multipliers
    //     let multiplierEffects = rawEffects.filter(
    //         (effect) => effect.type === EffectNames.ModifyMilitarySkillMultiplier
    //     );
    //     multiplierEffects.forEach((multiplierEffect) => {
    //         let multiplier = multiplierEffect.getValue(this);
    //         let currentTotal = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
    //         let amount = (multiplier - 1) * currentTotal;
    //         modifiers.push(StatModifier.fromEffect(amount, multiplierEffect));
    //     });

    //     return modifiers;
    // }

    // getPoliticalModifiers(exclusions) {
    //     let baseSkillModifiers = this.getBaseSkillModifiers();
    //     if (isNaN(baseSkillModifiers.basePoliticalSkill)) {
    //         return baseSkillModifiers.basePoliticalModifiers;
    //     }

    //     if (!exclusions) {
    //         exclusions = [];
    //     }

    //     let rawEffects;
    //     if (typeof exclusions === 'function') {
    //         rawEffects = this.getRawEffects().filter((effect) => !exclusions(effect));
    //     } else {
    //         rawEffects = this.getRawEffects().filter((effect) => !exclusions.includes(effect.type));
    //     }

    //     // set effects
    //     let setEffects = rawEffects.filter((effect) => effect.type === EffectNames.SetPoliticalSkill);
    //     if (setEffects.length > 0) {
    //         let latestSetEffect = _.last(setEffects);
    //         let setAmount = latestSetEffect.getValue(this);
    //         return [
    //             StatModifier.fromEffect(
    //                 setAmount,
    //                 latestSetEffect,
    //                 true,
    //                 `Set by ${StatModifier.getEffectName(latestSetEffect)}`
    //             )
    //         ];
    //     }

    //     let modifiers = baseSkillModifiers.basePoliticalModifiers;

    //     // skill modifiers
    //     let modifierEffects = rawEffects.filter(
    //         (effect) =>
    //             effect.type === EffectNames.AttachmentPoliticalSkillModifier ||
    //             effect.type === EffectNames.ModifyPoliticalSkill ||
    //             effect.type === EffectNames.ModifyBothSkills
    //     );
    //     modifierEffects.forEach((modifierEffect) => {
    //         const value = modifierEffect.getValue(this);
    //         modifiers.push(StatModifier.fromEffect(value, modifierEffect));
    //     });

    //     // adjust honor status effects
    //     this.adjustHonorStatusModifiers(modifiers);

    //     // multipliers
    //     let multiplierEffects = rawEffects.filter(
    //         (effect) => effect.type === EffectNames.ModifyPoliticalSkillMultiplier
    //     );
    //     multiplierEffects.forEach((multiplierEffect) => {
    //         let multiplier = multiplierEffect.getValue(this);
    //         let currentTotal = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
    //         let amount = (multiplier - 1) * currentTotal;
    //         modifiers.push(StatModifier.fromEffect(amount, multiplierEffect));
    //     });

    //     return modifiers;
    // }

    get showStats() {
        return isArena(this.location) && this.type === CardTypes.Unit;
    }

    get militarySkillSummary() {
        if (!this.showStats) {
            return {};
        }
        let modifiers = this.getPowerModifiers().map((modifier) => Object.assign({}, modifier));
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        return {
            stat: isNaN(skill) ? '-' : Math.max(skill, 0).toString(),
            modifiers: modifiers
        };
    }

    get politicalSkillSummary() {
        if (!this.showStats) {
            return {};
        }
        let modifiers = this.getPoliticalModifiers().map((modifier) => Object.assign({}, modifier));
        modifiers.forEach((modifier) => (modifier = Object.assign({}, modifier)));
        let skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
        return {
            stat: isNaN(skill) ? '-' : Math.max(skill, 0).toString(),
            modifiers: modifiers
        };
    }

    exhaust() {
        this.exhausted = true;
    }

    ready() {
        this.exhausted = false;
    }

    canPlay(context, type) {
        return (
            this.checkRestrictions(type, context) &&
            context.player.checkRestrictions(type, context) &&
            this.checkRestrictions('play', context) &&
            context.player.checkRestrictions('play', context) &&
            (!this.hasPrintedKeyword('peaceful') || !this.game.currentConflict)
        );
    }

    getActions(location = this.location) {
        // if card is already in play or is an event, return the default actions
        if (location === Locations.SpaceArena || location === Locations.GroundArena || this.type === CardTypes.Event) {
            return super.getActions();
        }

        // TODO: add base / leader actions if this doesn't already cover them

        // otherwise (i.e. card is in hand), return play card action(s) + other available card actions
        return this.getPlayActions().concat(super.getActions());
    }

    /**
     * Deals with the engine effects of leaving play, making sure all statuses are removed. Anything which changes
     * the state of the card should be here. This is also called in some strange corner cases e.g. for attachments
     * which aren't actually in play themselves when their parent (which is in play) leaves play.
     */
    leavesPlay() {
        // If this is an attachment and is attached to another card, we need to remove all links between them
        if (this.parent && this.parent.attachments) {
            this.parent.removeAttachment(this);
            this.parent = null;
        }

        // Remove any cards underneath from the game
        const cardsUnderneath = this.controller.getSourceListForPile(this.uuid).map((a) => a);
        if (cardsUnderneath.length > 0) {
            cardsUnderneath.forEach((card) => {
                this.controller.moveCard(card, Locations.RemovedFromGame);
            });
            this.game.addMessage(
                '{0} {1} removed from the game due to {2} leaving play',
                cardsUnderneath,
                cardsUnderneath.length === 1 ? 'is' : 'are',
                this
            );
        }

        if (this.isParticipating()) {
            this.game.currentConflict.removeFromConflict(this);
        }

        this.exhausted = false;
        this.new = false;
        super.leavesPlay();
    }

    // canDeclareAsAttacker(conflictType, ring, province, incomingAttackers = undefined) {
    //     // eslint-disable-line no-unused-vars
    //     if (!province) {
    //         let provinces =
    //             this.game.currentConflict && this.game.currentConflict.defendingPlayer
    //                 ? this.game.currentConflict.defendingPlayer.getProvinces()
    //                 : null;
    //         if (provinces) {
    //             return provinces.some(
    //                 (a) =>
    //                     a.canDeclare(conflictType, ring) &&
    //                     this.canDeclareAsAttacker(conflictType, ring, a, incomingAttackers)
    //             );
    //         }
    //     }

    //     let attackers = this.game.isDuringConflict() ? this.game.currentConflict.attackers : [];
    //     if (incomingAttackers) {
    //         attackers = incomingAttackers;
    //     }
    //     if (!attackers.includes(this)) {
    //         attackers = attackers.concat(this);
    //     }

    //     // Check if I add an element that I can\'t attack with
    //     const elementsAdded = this.upgrades.reduce(
    //         (array, attachment) => array.concat(attachment.getEffects(EffectNames.AddElementAsAttacker)),
    //         this.getEffects(EffectNames.AddElementAsAttacker)
    //     );

    //     if (
    //         elementsAdded.some((element) =>
    //             this.game.rings[element]
    //                 .getEffects(EffectNames.CannotDeclareRing)
    //                 .some((match) => match(this.controller))
    //         )
    //     ) {
    //         return false;
    //     }

    //     if (
    //         conflictType === ConflictTypes.Military &&
    //         attackers.reduce((total, card) => total + card.sumEffects(EffectNames.CardCostToAttackMilitary), 0) >
    //             this.controller.hand.size()
    //     ) {
    //         return false;
    //     }

    //     let fateCostToAttackProvince = province ? province.getFateCostToAttack() : 0;
    //     if (
    //         attackers.reduce((total, card) => total + card.sumEffects(EffectNames.FateCostToAttack), 0) +
    //             fateCostToAttackProvince >
    //         this.controller.fate
    //     ) {
    //         return false;
    //     }
    //     if (this.anyEffect(EffectNames.CanOnlyBeDeclaredAsAttackerWithElement)) {
    //         for (let element of this.getEffects(EffectNames.CanOnlyBeDeclaredAsAttackerWithElement)) {
    //             if (!ring.hasElement(element) && !elementsAdded.includes(element)) {
    //                 return false;
    //             }
    //         }
    //     }

    //     if (this.controller.anyEffect(EffectNames.LimitLegalAttackers)) {
    //         const checks = this.controller.getEffects(EffectNames.LimitLegalAttackers);
    //         let valid = true;
    //         checks.forEach((check) => {
    //             if (typeof check === 'function') {
    //                 valid = valid && check(this);
    //             }
    //         });
    //         if (!valid) {
    //             return false;
    //         }
    //     }

    //     return (
    //         this.checkRestrictions('declareAsAttacker', this.game.getFrameworkContext()) &&
    //         this.canParticipateAsAttacker(conflictType) &&
    //         this.location === Locations.PlayArea &&
    //         !this.exhausted
    //     );
    // }

    // canDeclareAsDefender(conflictType = this.game.currentConflict.conflictType) {
    //     return (
    //         this.checkRestrictions('declareAsDefender', this.game.getFrameworkContext()) &&
    //         this.canParticipateAsDefender(conflictType) &&
    //         this.location === Locations.PlayArea &&
    //         !this.exhausted &&
    //         !this.covert
    //     );
    // }

    // canParticipateAsAttacker(conflictType = this.game.currentConflict.conflictType) {
    //     let effects = this.getEffects(EffectNames.CannotParticipateAsAttacker);
    //     return !effects.some((value) => value === 'both' || value === conflictType) && !this.hasDash(conflictType);
    // }

    // canParticipateAsDefender(conflictType = this.game.currentConflict.conflictType) {
    //     let effects = this.getEffects(EffectNames.CannotParticipateAsDefender);
    //     let hasDash = conflictType ? this.hasDash(conflictType) : false;

    //     return !effects.some((value) => value === 'both' || value === conflictType) && !hasDash;
    // }

    // bowsOnReturnHome() {
    //     return !this.anyEffect(EffectNames.DoesNotBow);
    // }

    setDefaultController(player) {
        this.defaultController = player;
    }

    // getModifiedController() {
    //     if (
    //         this.location === Locations.PlayArea ||
    //         (this.type === CardTypes.Holding && this.location.includes('province'))
    //     ) {
    //         return this.mostRecentEffect(EffectNames.TakeControl) || this.defaultController;
    //     }
    //     return this.owner;
    // }

    // canDisguise(card, context, intoConflictOnly) {
    //     return (
    //         this.disguisedKeywordTraits.some((trait) => card.hasTrait(trait)) &&
    //         card.allowGameAction('discardFromPlay', context) &&
    //         !card.isUnique() &&
    //         (!intoConflictOnly || card.isParticipating())
    //     );
    // }

    // play() {
    //     //empty function so playcardaction doesn't crash the game
    // }

    // getSummary(activePlayer, hideWhenFaceup) {
    //     let baseSummary = super.getSummary(activePlayer, hideWhenFaceup);

    //     return _.extend(baseSummary, {
    //         attached: !!this.parent,
    //         attachments: this.upgrades.map((attachment) => {
    //             return attachment.getSummary(activePlayer, hideWhenFaceup);
    //         }),
    //         childCards: this.childCards.map((card) => {
    //             return card.getSummary(activePlayer, hideWhenFaceup);
    //         }),
    //         inConflict: this.inConflict,
    //         isConflict: this.isConflict,
    //         isDynasty: this.isDynasty,
    //         isPlayableByMe: this.isConflict && this.controller.isCardInPlayableLocation(this, PlayTypes.PlayFromHand),
    //         isPlayableByOpponent:
    //             this.isConflict &&
    //             this.controller.opponent &&
    //             this.controller.opponent.isCardInPlayableLocation(this, PlayTypes.PlayFromHand),
    //         bowed: this.exhausted,
    //         fate: this.fate,
    //         new: this.new,
    //         covert: this.covert,
    //         showStats: this.showStats,
    //         militarySkillSummary: this.militarySkillSummary,
    //         politicalSkillSummary: this.politicalSkillSummary,
    //         glorySummary: this.glorySummary,
    //         controller: this.controller.getShortSummary()
    //     });
    // }
}

export = BaseCard;