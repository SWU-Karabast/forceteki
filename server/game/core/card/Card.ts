const AbilityDsl = require('../../AbilityDsl.js');
const Effects = require('../../effects/EffectLibrary.js');
const EffectSource = require('../effect/EffectSource.js');
import CardAbility = require('../ability/CardAbility.js');
// import TriggeredAbility = require('./triggeredability');
import Game = require('../Game.js');
import Contract from '../utils/Contract';

import { AbilityContext } from '../ability/AbilityContext.js';
import { CardActionAbility } from '../ability/CardActionAbility.js';
import { AttackSystem } from '../../gameSystems/AttackSystem.js';
import {
    AbilityType,
    CardType,
    Duration,
    EffectName,
    EventName,
    Location,
    Aspect,
    WildcardLocation,
    StatType
} from '../Constants.js';
import { isArena, cardLocationMatches, checkConvertToEnum } from '../utils/EnumHelpers.js';
import {
    IActionProps,
    IAttachmentConditionProps,
    IPersistentEffectProps,
    ITriggeredAbilityProps,
    ITriggeredAbilityWhenProps
} from '../../Interfaces.js';
// import { PlayAttachmentAction } from './PlayAttachmentAction.js';
// import { StatusToken } from './StatusToken';
import Player from '../Player.js';
import StatModifier = require('./StatModifier.js');
import type { ICardEffect } from '../effect/ICardEffect.js';
// import type { GainAllAbilities } from './Effects/Library/gainAllAbilities';
import { PlayUnitAction } from '../../actions/PlayUnitAction.js';
import { TriggerAttackAction } from '../../actions/TriggerAttackAction.js';

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
class Card extends EffectSource {
    controller: Player;
    game: Game;

    id: string;
    printedTitle: string;
    printedSubtitle: string;
    internalName: string;
    type: CardType;
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
    location: Location;

    isBase: boolean = false;
    isLeader: boolean = false;

    upgrades = [] as Card[];
    childCards = [] as Card[];
    // statusTokens = [] as StatusToken[];
    allowedAttachmentTraits = [] as string[];
    printedKeywords: Array<string> = [];
    aspects: Array<Aspect> = [];


    defaultController: Player;
    parent: Card | null;
    printedHp: number | null;
    printedPower: number | null;
    printedCost: number | null;
    exhausted: boolean | null;
    damage: number | null;
    hiddenForOwner: boolean;
    hiddenForOpponent: boolean;

    constructor(
        public owner: Player,
        public cardData: any
    ) {
        super(owner.game);

        this.#validateCardData(cardData);

        this.controller = owner;

        this.id = cardData.id;
        this.unique = cardData.unique;

        this.printedTitle = cardData.title;
        this.printedSubtitle = cardData.subtitle;
        this.internalName = cardData.internalName;
        this.printedType = checkConvertToEnum([cardData.type], CardType)[0]; // TODO: does this work for leader consistently, since it has two types?
        this.traits = cardData.traits;  // TODO: enum for these
        this.aspects = checkConvertToEnum(cardData.aspects, Aspect);
        this.printedKeywords = cardData.keywords;   // TODO: enum for these

        this.setupCardAbilities(AbilityDsl);
        // this.parseKeywords(cardData.text ? cardData.text.replace(/<[^>]*>/g, '').toLowerCase() : '');
        // this.applyAttachmentBonus();





        // *************************** DECKCARD.JS CONSTRUCTOR ******************************

        this.defaultController = owner;
        this.parent = null;
        this.printedHp = this.getPrintedStat(StatType.Hp);
        this.printedPower = this.getPrintedStat(StatType.Power);
        this.printedCost = parseInt(this.cardData.cost);
        this.exhausted = null;
        this.damage = null;
        this.hiddenForOwner = true;

        switch (cardData.arena) {
            case "space":
                this.defaultArena = Location.SpaceArena;
                break;
            case "ground":
                this.defaultArena = Location.GroundArena;
                break;
            default:
                this.defaultArena = null;
        }

        // if (cardData.type === CardType.Character) {
        //     this.abilities.reactions.push(new CourtesyAbility(this.game, this));
        //     this.abilities.reactions.push(new PrideAbility(this.game, this));
        //     this.abilities.reactions.push(new SincerityAbility(this.game, this));
        // }
        // if (cardData.type === CardType.Attachment) {
        //     this.abilities.reactions.push(new CourtesyAbility(this.game, this));
        //     this.abilities.reactions.push(new SincerityAbility(this.game, this));
        // }
        // if (cardData.type === CardType.Event && this.hasEphemeral()) {
        //     this.eventRegistrarForEphemeral = new EventRegistrar(this.game, this);
        //     this.eventRegistrarForEphemeral.register([{ [EventName.OnCardPlayed]: 'handleEphemeral' }]);
        // }
        // if (this.isDynasty) {
        //     this.abilities.reactions.push(new RallyAbility(this.game, this));
        // }
    }

    #validateCardData(cardData: any) {
        Contract.assertNotNullLike(cardData);
        Contract.assertNotNullLike(cardData.id);
        Contract.assertNotNullLike(cardData.title);
        Contract.assertNotNullLike(cardData.type);
        Contract.assertNotNullLike(cardData.traits);
        Contract.assertNotNullLike(cardData.aspects);
        Contract.assertNotNullLike(cardData.keywords);
        Contract.assertNotNullLike(cardData.unique);
    }

    get name(): string {
        let copyEffect = this.mostRecentEffect(EffectName.CopyCharacter);
        return copyEffect ? copyEffect.printedName : this.printedTitle;
    }

    set name(name: string) {
        this.printedTitle = name;
    }

    #mostRecentEffect(predicate: (effect: ICardEffect) => boolean): ICardEffect | undefined {
        const effects = this.getRawEffects().filter(predicate);
        return effects[effects.length - 1];
    }

    getActions(): any[] {
        return this.actions.slice();
    }

    get actions(): CardActionAbility[] {
        return this.#getActions();
    }

    #getActions(location = this.location, ignoreDynamicGains = false): CardActionAbility[] {
        let actions = this.abilities.actions;

        const mostRecentEffect = this.#mostRecentEffect((effect) => effect.type === EffectName.CopyCharacter);
        if (mostRecentEffect) {
            actions = mostRecentEffect.value.getActions(this);
        }
        
        const effectActions = this.getEffects(EffectName.GainAbility).filter(
            (ability) => ability.abilityType === AbilityType.Action
        );

        // for (const effect of this.getRawEffects()) {
        //     if (effect.type === EffectName.GainAllAbilities) {
        //         actions = actions.concat((effect.value as GainAllAbilities).getActions(this));
        //     }
        // }
        // if (!ignoreDynamicGains) {
        //     if (this.anyEffect(EffectName.GainAllAbilitiesDynamic)) {
        //         const context = this.game.getFrameworkContext(this.controller);
        //         const effects = this.getRawEffects().filter(
        //             (effect) => effect.type === EffectName.GainAllAbilitiesDynamic
        //         );
        //         effects.forEach((effect) => {
        //             effect.value.calculate(this, context); //fetch new abilities
        //             actions = actions.concat(effect.value.getActions(this));
        //         });
        //     }
        // }

        // const lostAllNonKeywordsAbilities = this.anyEffect(EffectName.LoseAllNonKeywordAbilities);
        let allAbilities = actions.concat(effectActions);
        // if (lostAllNonKeywordsAbilities) {
        //     allAbilities = allAbilities.filter((a) => a.isKeywordAbility());
        // }

        if (this.type === CardType.Unit) {
            allAbilities.push(new TriggerAttackAction(this));
        }

        // if card is already in play or is an event, return the default actions
        if (isArena(location) || this.type === CardType.Event) {
            return allAbilities;
        }

        // TODO: add base / leader actions if this doesn't already cover them

        // otherwise (i.e. card is in hand), return play card action(s) + other available card actions
        return allAbilities.concat(this.getPlayCardActions());
    }

    // _getReactions(ignoreDynamicGains = false): TriggeredAbility[] {
    //     const TriggeredAbilityTypes = [
    //         AbilityType.ForcedInterrupt,
    //         AbilityType.ForcedReaction,
    //         AbilityType.Interrupt,
    //         AbilityType.Reaction,
    //         AbilityType.WouldInterrupt
    //     ];
    //     let reactions = this.abilities.reactions;
    //     const mostRecentEffect = this.#mostRecentEffect((effect) => effect.type === EffectName.CopyCharacter);
    //     if (mostRecentEffect) {
    //         reactions = mostRecentEffect.value.getReactions(this);
    //     }
    //     const effectReactions = this.getEffects(EffectName.GainAbility).filter((ability) =>
    //         TriggeredAbilityTypes.includes(ability.abilityType)
    //     );
    //     for (const effect of this.getRawEffects()) {
    //         if (effect.type === EffectName.GainAllAbilities) {
    //             reactions = reactions.concat((effect.value as GainAllAbilities).getReactions(this));
    //         }
    //     }
    //     if (!ignoreDynamicGains) {
    //         if (this.anyEffect(EffectName.GainAllAbilitiesDynamic)) {
    //             const effects = this.getRawEffects().filter(
    //                 (effect) => effect.type === EffectName.GainAllAbilitiesDynamic
    //             );
    //             const context = this.game.getFrameworkContext(this.controller);
    //             effects.forEach((effect) => {
    //                 effect.value.calculate(this, context); //fetch new abilities
    //                 reactions = reactions.concat(effect.value.getReactions(this));
    //             });
    //         }
    //     }

    //     const lostAllNonKeywordsAbilities = this.anyEffect(EffectName.LoseAllNonKeywordAbilities);
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
    //     let gainedPersistentEffects = this.getEffects(EffectName.GainAbility).filter(
    //         (ability) => ability.abilityType === AbilityType.Persistent
    //     );

    //     const mostRecentEffect = this.#mostRecentEffect((effect) => effect.type === EffectName.CopyCharacter);
    //     if (mostRecentEffect) {
    //         return gainedPersistentEffects.concat(mostRecentEffect.value.getPersistentEffects());
    //     }
    //     for (const effect of this.getRawEffects()) {
    //         if (effect.type === EffectName.GainAllAbilities) {
    //             gainedPersistentEffects = gainedPersistentEffects.concat(
    //                 (effect.value as GainAllAbilities).getPersistentEffects()
    //             );
    //         }
    //     }
    //     if (!ignoreDynamicGains) {
    //         // This is needed even though there are no dynamic persistent effects
    //         // Because the effect itself is persistent and to ensure we pick up all reactions/interrupts, we need this check to happen
    //         // As the game state is applying the effect
    //         if (this.anyEffect(EffectName.GainAllAbilitiesDynamic)) {
    //             const effects = this.getRawEffects().filter(
    //                 (effect) => effect.type === EffectName.GainAllAbilitiesDynamic
    //             );
    //             const context = this.game.getFrameworkContext(this.controller);
    //             effects.forEach((effect) => {
    //                 effect.value.calculate(this, context); //fetch new abilities
    //                 gainedPersistentEffects = gainedPersistentEffects.concat(effect.value.getPersistentEffects());
    //             });
    //         }
    //     }

    //     const lostAllNonKeywordsAbilities = this.anyEffect(EffectName.LoseAllNonKeywordAbilities);
    //     if (lostAllNonKeywordsAbilities) {
    //         let allAbilities = this.abilities.persistentEffects.concat(gainedPersistentEffects);
    //         allAbilities = allAbilities.filter((a) => a.isKeywordEffect || a.type === EffectName.AddKeyword);
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

    action(properties: IActionProps<this>): void {
        this.abilities.actions.push(this.createAction(properties));
    }

    createAction(properties: IActionProps): CardActionAbility {
        return new CardActionAbility(this.game, this, properties);
    }

    // triggeredAbility(abilityType: AbilityType, properties: TriggeredAbilityProps): void {
    //     this.abilities.reactions.push(this.createTriggeredAbility(abilityType, properties));
    // }

    // createTriggeredAbility(abilityType: AbilityType, properties: TriggeredAbilityProps): TriggeredAbility {
    //     return new TriggeredAbility(this.game, this, abilityType, properties);
    // }

    // reaction(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityType.Reaction, properties);
    // }

    // forcedReaction(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityType.ForcedReaction, properties);
    // }

    // wouldInterrupt(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityType.WouldInterrupt, properties);
    // }

    // interrupt(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityType.Interrupt, properties);
    // }

    // forcedInterrupt(properties: TriggeredAbilityProps): void {
    //     this.triggeredAbility(AbilityType.ForcedInterrupt, properties);
    // }

    // /**
    //  * Applies an effect that continues as long as the card providing the effect
    //  * is both in play and not blank.
    //  */
    // persistentEffect(properties: PersistentEffectProps<this>): void {
    //     const allowedLocations = [
    //         Location.Any,
    //         Location.ConflictDiscardPile,
    //         Location.PlayArea,
    //         Location.Provinces
    //     ];
    //     const defaultLocationForType = {
    //         province: Location.Provinces,
    //         holding: Location.Provinces,
    //         stronghold: Location.Provinces
    //     };

    //     let location = properties.location || defaultLocationForType[this.getType()] || isArena(properties.location);
    //     if (!allowedLocations.includes(location)) {
    //         throw new Error(`'${location}' is not a supported effect location.`);
    //     }
    //     this.abilities.persistentEffects.push({ duration: Duration.Persistent, location, ...properties });
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
    //             location: Location.Any,
    //             effect: effects
    //         });
    //     }
    // }

    hasKeyword(keyword: string): boolean {
        const targetKeyword = keyword.toLowerCase();

        const addKeywordEffects = this.getEffects(EffectName.AddKeyword).filter(
            (effectValue: string) => effectValue === targetKeyword
        );
        const loseKeywordEffects = this.getEffects(EffectName.LoseKeyword).filter(
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
    //     const copyEffect = this.mostRecentEffect(EffectName.CopyCharacter);
    //     const set = new Set(
    //         copyEffect
    //             ? (copyEffect.traits as string[])
    //             : this.getEffects(EffectName.Blank).some((blankTraits: boolean) => blankTraits)
    //             ? []
    //             : this.traits
    //     );

    //     for (const gainedTrait of this.getEffects(EffectName.AddTrait)) {
    //         set.add(gainedTrait);
    //     }
    //     for (const lostTrait of this.getEffects(EffectName.LoseTrait)) {
    //         set.delete(lostTrait);
    //     }

    //     return set;
    // }

    // isFaction(faction: Faction): boolean {
    //     const copyEffect = this.mostRecentEffect(EffectName.CopyCharacter);
    //     const cardFaction = copyEffect ? copyEffect.printedFaction : this.printedFaction;
    //     if (faction === 'neutral') {
    //         return cardFaction === faction && !this.anyEffect(EffectName.AddFaction);
    //     }
    //     return cardFaction === faction || this.getEffects(EffectName.AddFaction).includes(faction);
    // }

    // isInPlay(): boolean {
    //     if (this.isFacedown()) {
    //         return false;
    //     }
    //     if ([CardType.Holding, CardType.Province, CardType.Stronghold].includes(this.type)) {
    //         return this.isInProvince();
    //     }
    //     return this.location === Location.PlayArea;
    // }

    // applyAnyLocationPersistentEffects(): void {
    //     for (const effect of this.persistentEffects) {
    //         if (effect.location === Location.Any) {
    //             effect.ref = this.addEffectToEngine(effect);
    //         }
    //     }
    // }

    // updateAbilityEvents(from: Location, to: Location, reset: boolean = true) {
    //     if (reset) {
    //         this.#resetLimits();
    //     }
    //     for (const reaction of this.reactions) {
    //         if (this.type === CardType.Event) {
    //             if (
    //                 to === Location.ConflictDeck ||
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

    // updateEffects(from: Location, to: Location) {
    //     const activeLocations = {
    //         'conflict discard pile': [Location.ConflictDiscardPile],
    //         'play area': [Location.PlayArea],
    //         province: this.game.getProvinceArray()
    //     };
    //     if (
    //         !activeLocations[Location.Provinces].includes(from) ||
    //         !activeLocations[Location.Provinces].includes(to)
    //     ) {
    //         this.removeLastingEffects();
    //     }
    //     this.updateStatusTokenEffects();
    //     for (const effect of this.persistentEffects) {
    //         if (effect.location === Location.Any) {
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

    moveTo(targetLocation: Location) {
        let originalLocation = this.location;

        if (originalLocation === targetLocation) {
            return;   
        }

        this.location = targetLocation;
        this.#setDefaultStatusForLocation(targetLocation);

        if (originalLocation !== targetLocation) {
            // this.updateAbilityEvents(originalLocation, targetLocation, !sameLocation);
            // this.updateEffects(originalLocation, targetLocation);
            this.game.emitEvent(EventName.OnCardMoved, {
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
    //     const effects = this.getRawEffects().filter((effect) => effect.type === EffectName.IncreaseLimitOnAbilities);
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
    //         (effect) => effect.type === EffectName.IncreaseLimitOnPrintedAbilities
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
    //         ![...this.game.getProvinceArray(), Location.PlayArea].includes(this.location)
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
    //     if (this.location === Location.PlayArea || this.isProvince || this.isBase) {
    //         menu.push(...this.menu);
    //     }
    //     return menu;
    // }

    isUnique(): boolean {
        return this.cardData.is_unique;
    }

    isBlank(): boolean {
        return this.anyEffect(EffectName.Blank);
    }

    getPrintedFaction(): string {
        return this.cardData.clan || this.cardData.faction;
    }

    checkRestrictions(actionType, context: AbilityContext): boolean {
        let player = (context && context.player) || this.controller;
        return (
            super.checkRestrictions(actionType, context) &&
            player.checkRestrictions(actionType, context)
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

    getReactions(): any[] {
        return this.reactions.slice();
    }

    readiesDuringReadyPhase(): boolean {
        return !this.anyEffect(EffectName.DoesNotReady);
    }

    // hideWhenFacedown(): boolean {
    //     return !this.anyEffect(EffectName.CanBeSeenWhenFacedown);
    // }

    // TODO: would something like this be helpful for swu?
    parseKeywords(text: string) {
        // const potentialKeywords = [];
        // for (const line of text.split('\n')) {
        //     for (const k of line.slice(0, -1).split('.')) {
        //         potentialKeywords.push(k.trim());
        //     }
        // }

        // for (const keyword of potentialKeywords) {
        //     if (ValidKeywords.has(keyword)) {
        //         this.printedKeywords.push(keyword);
        //     } else if (keyword.startsWith('disguised ')) {
        //         this.disguisedKeywordTraits.push(keyword.replace('disguised ', ''));
        //     } else if (keyword.startsWith('no attachments except')) {
        //         var traits = keyword.replace('no attachments except ', '');
        //         this.allowedAttachmentTraits = traits.split(' or ');
        //     } else if (keyword.startsWith('no attachments,')) {
        //         //catch all for statements that are to hard to parse automatically
        //     } else if (keyword.startsWith('no attachments')) {
        //         this.allowedAttachmentTraits = ['none'];
        //     }
        // }

        // TODO: uncomment
        // for (const keyword of this.printedKeywords) {
        //     this.persistentEffect({ effect: AbilityDsl.effects.addKeyword(keyword) });
        // }
    }

    // isAttachmentBonusModifierSwitchActive() {
    //     const switches = this.getEffects(EffectName.SwitchAttachmentSkillModifiers).filter(Boolean);
    //     // each pair of switches cancels each other. Need an odd number of switches to be active
    //     return switches.length % 2 === 1;
    // }

    // applyAttachmentBonus() {
    //     const militaryBonus = parseInt(this.cardData.military_bonus);
    //     const politicalBonus = parseInt(this.cardData.political_bonus);
    //     if (!isNaN(militaryBonus)) {
    //         this.persistentEffect({
    //             match: (card) => card === this.parent,
    //             targetController: RelativePlayer.Any,
    //             effect: AbilityDsl.effects.attachmentMilitarySkillModifier(() =>
    //                 this.isAttachmentBonusModifierSwitchActive() ? politicalBonus : militaryBonus
    //             )
    //         });
    //     }
    //     if (!isNaN(politicalBonus)) {
    //         this.persistentEffect({
    //             match: (card) => card === this.parent,
    //             targetController: RelativePlayer.Any,
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
    //     for (const effectCard of this.getEffects(EffectName.CannotHaveOtherRestrictedAttachments)) {
    //         for (const card of this.upgrades) {
    //             if (card.isRestricted() && card !== effectCard) {
    //                 illegalAttachments.add(card);
    //             }
    //         }
    //     }

    //     const attachmentLimits = this.upgrades.filter((card) => card.anyEffect(EffectName.AttachmentLimit));
    //     for (const card of attachmentLimits) {
    //         let limit = Math.max(...card.getEffects(EffectName.AttachmentLimit));
    //         const matchingAttachments = this.upgrades.filter((attachment) => attachment.id === card.id);
    //         for (const card of matchingAttachments.slice(0, -limit)) {
    //             illegalAttachments.add(card);
    //         }
    //     }

    //     const frameworkLimitsAttachmentsWithRepeatedNames =
    //         this.game.gameMode === GameMode.Emerald || this.game.gameMode === GameMode.Obsidian;
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
    //         (array, card) => array.concat(card.getEffects(EffectName.AttachmentRestrictTraitAmount)),
    //         []
    //     )) {
    //         for (const trait of Object.keys(object)) {
    //             const matchingAttachments = this.upgrades.filter((attachment) => attachment.hasTrait(trait));
    //             for (const card of matchingAttachments.slice(0, -object[trait])) {
    //                 illegalAttachments.add(card);
    //             }
    //         }
    //     }
    //     let maximumRestricted = 2 + this.sumEffects(EffectName.ModifyRestrictedAttachmentAmount);
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
    //         targetController: RelativePlayer.Any,
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
    //         parent.getType() !== CardType.Character ||
    //         (!properties.ignoreType && this.getType() !== CardType.Attachment)
    //     ) {
    //         return false;
    //     }

    //     const attachmentController = properties.controller ?? this.controller;
    //     for (const effect of this.getRawEffects() as CardEffect[]) {
    //         switch (effect.type) {
    //             case EffectName.AttachmentMyControlOnly: {
    //                 if (attachmentController !== parent.controller) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectName.AttachmentOpponentControlOnly: {
    //                 if (attachmentController === parent.controller) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectName.AttachmentUniqueRestriction: {
    //                 if (!parent.isUnique()) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectName.AttachmentFactionRestriction: {
    //                 const factions = effect.getValue<Faction[]>(this as any);
    //                 if (!factions.some((faction) => parent.isFaction(faction))) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectName.AttachmentTraitRestriction: {
    //                 const traits = effect.getValue<string[]>(this as any);
    //                 if (!traits.some((trait) => parent.hasTrait(trait))) {
    //                     return false;
    //                 }
    //                 break;
    //             }
    //             case EffectName.AttachmentCardCondition: {
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

    getPlayCardActions() {
        // events are a special case
        if (this.type === CardType.Event) {
            return this.getActions();
        }
        let actions = this.abilities.playActions.slice();
        if (this.type === CardType.Unit) {
            actions.push(new PlayUnitAction(this));
        } 
        // else if (this.type === CardType.Upgrade) {
        //     actions.push(new PlayAttachmentAction(this));
        // }
        return actions;
    }

    /**
     * This removes an attachment from this card's attachment Array.  It doesn't open any windows for
     * game effects to respond to.
     * @param {Card} attachment
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
        return this.location === Location.Resource;
    }

    // getSummary(activePlayer, hideWhenFaceup) {
    //     let isActivePlayer = activePlayer === this.controller;
    //     let selectionState = activePlayer.getCardSelectionState(this);

    //     // This is my facedown card, but I'm not allowed to look at it
    //     // OR This is not my card, and it's either facedown or hidden from me
    //     if (
    //         isActivePlayer
    //             ? this.isFacedown() && this.hideWhenFacedown()
    //             : this.isFacedown() || hideWhenFaceup || this.anyEffect(EffectName.HideWhenFaceUp)
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
        
        if (this.damage >= this.hp) {
            if (this === this.owner.base as Card) {
                this.game.recordWinner(this.owner.opponent, "base destroyed");
            } else {
                this.owner.defeatCard(this);
            }
        }
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
                effect.type === EffectName.UpgradeHpModifier ||
                effect.type === EffectName.ModifyHp
        );
        modifierEffects.forEach((modifierEffect) => {
            const value = modifierEffect.getValue(this);
            modifiers.push(StatModifier.fromEffect(value, modifierEffect));
        });

        return modifiers;
    }

    // TODO: consolidate these stat getter methods, make some of them private at least
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
            (effect) => effect.type === EffectName.SetPower
        );
        if (setEffects.length > 0) {
            let latestSetEffect = setEffects.at(-1);
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
                effect.type === EffectName.UpgradePowerModifier ||
                effect.type === EffectName.ModifyPower ||
                effect.type === EffectName.ModifyStats
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
            EffectName.CopyCharacter,
            EffectName.CalculatePrintedPower,
            EffectName.SetBasePower,
        ];

        let baseEffects = this.getRawEffects().filter((effect) => baseModifierEffects.includes(effect.type));
        let basePowerModifiers = [StatModifier.fromCard(this.printedPower, this, 'Printed power', false)];
        let baseHpModifiers = [StatModifier.fromCard(this.printedHp, this, 'Printed hp', false)];
        let basePower = this.printedPower;
        let baseHp = this.printedHp;

        baseEffects.forEach((effect) => {
            switch (effect.type) {
                // this case is for cards that don't have a default printed power but it is instead calculated
                case EffectName.CalculatePrintedPower: {
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
                case EffectName.CopyCharacter: {
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
                case EffectName.SetBasePower:
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
            let lastModifier = overridingPowerModifiers.at(-1);
            basePowerModifiers = [lastModifier];
            basePower = lastModifier.amount;
        }
        let overridingHpModifiers = baseHpModifiers.filter((mod) => mod.overrides);
        if (overridingHpModifiers.length > 0) {
            let lastModifier = overridingHpModifiers.at(-1);
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
        let copyEffect = this.mostRecentEffect(EffectName.CopyCharacter);
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
        let clone = new Card(this.owner, this.cardData);

        // clone.upgrades = _(this.upgrades.map((attachment) => attachment.createSnapshot()));
        clone.childCards = this.childCards.map((card) => card.createSnapshot());
        clone.effects = [...this.effects];
        clone.controller = this.controller;
        clone.exhausted = this.exhausted;
        // clone.statusTokens = [...this.statusTokens];
        clone.location = this.location;
        clone.parent = this.parent;
        clone.aspects = [...this.aspects];
        // clone.fate = this.fate;
        // clone.inConflict = this.inConflict;
        clone.traits = Array.from(this.getTraits());
        clone.uuid = this.uuid;
        return clone;
    }

    // hasDash(type = '') {
    //     if (type === 'glory' || this.printedType !== CardType.Character) {
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
    //     let skillFunction = this.mostRecentEffect(EffectName.ChangeContributionFunction);
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
    //     let modifierEffects = this.getRawEffects().filter((effect) => effect.type === EffectName.ModifyBothSkills);

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
    //         (effect) => effect.type === EffectName.SetMilitarySkill || effect.type === EffectName.SetDash
    //     );
    //     if (setEffects.length > 0) {
    //         let latestSetEffect = _.last(setEffects);
    //         let setAmount = latestSetEffect.type === EffectName.SetDash ? undefined : latestSetEffect.getValue(this);
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
    //             effect.type === EffectName.AttachmentMilitarySkillModifier ||
    //             effect.type === EffectName.ModifyMilitarySkill ||
    //             effect.type === EffectName.ModifyBothSkills
    //     );
    //     modifierEffects.forEach((modifierEffect) => {
    //         const value = modifierEffect.getValue(this);
    //         modifiers.push(StatModifier.fromEffect(value, modifierEffect));
    //     });

    //     // adjust honor status effects
    //     this.adjustHonorStatusModifiers(modifiers);

    //     // multipliers
    //     let multiplierEffects = rawEffects.filter(
    //         (effect) => effect.type === EffectName.ModifyMilitarySkillMultiplier
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
    //     let setEffects = rawEffects.filter((effect) => effect.type === EffectName.SetPoliticalSkill);
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
    //             effect.type === EffectName.AttachmentPoliticalSkillModifier ||
    //             effect.type === EffectName.ModifyPoliticalSkill ||
    //             effect.type === EffectName.ModifyBothSkills
    //     );
    //     modifierEffects.forEach((modifierEffect) => {
    //         const value = modifierEffect.getValue(this);
    //         modifiers.push(StatModifier.fromEffect(value, modifierEffect));
    //     });

    //     // adjust honor status effects
    //     this.adjustHonorStatusModifiers(modifiers);

    //     // multipliers
    //     let multiplierEffects = rawEffects.filter(
    //         (effect) => effect.type === EffectName.ModifyPoliticalSkillMultiplier
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
        return isArena(this.location) && this.type === CardType.Unit;
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
            context.player.checkRestrictions('play', context)
        );
    }

    /**
     * Deals with the engine effects of leaving play, making sure all statuses are removed. Anything which changes
     * the state of the card should be here. This is also called in some strange corner cases e.g. for attachments
     * which aren't actually in play themselves when their parent (which is in play) leaves play.
     * 
     * Note that a card becoming a resource is _not_ leaving play.
     */
    leavesPlay() {
        // // If this is an attachment and is attached to another card, we need to remove all links between them
        // if (this.parent && this.parent.attachments) {
        //     this.parent.removeAttachment(this);
        //     this.parent = null;
        // }

        // TODO: reuse this for capture logic
        // // Remove any cards underneath from the game
        // const cardsUnderneath = this.controller.getSourceListForPile(this.uuid).map((a) => a);
        // if (cardsUnderneath.length > 0) {
        //     cardsUnderneath.forEach((card) => {
        //         this.controller.moveCard(card, Location.RemovedFromGame);
        //     });
        //     this.game.addMessage(
        //         '{0} {1} removed from the game due to {2} leaving play',
        //         cardsUnderneath,
        //         cardsUnderneath.length === 1 ? 'is' : 'are',
        //         this
        //     );
        // }
    }

    /**
     * Deals with the engine effects of entering a new location, making sure all statuses are set with legal values.
     * If a card should have a different status on entry (e.g., readied instead of exhausted), call this method first
     * and then update the card state(s) as needed.
     */
    #setDefaultStatusForLocation(location: Location) {
        switch (location) {
            case Location.SpaceArena:
            case Location.GroundArena:
                this.controller = this.owner;
                this.exhausted = this.type === CardType.Unit ? true : null;
                this.damage = this.type === CardType.Unit ? 0 : null;
                this.new = false;
                this.facedown = false;
                this.hiddenForOwner = false;
                this.hiddenForOpponent = false;
                break;

            case Location.Base:
            case Location.Leader:
                this.controller = this.owner;
                this.exhausted = this.type === CardType.Leader ? false : null;
                this.damage = this.type === CardType.Base ? 0 : null;
                this.new = false;
                this.facedown = false;
                this.hiddenForOwner = false;
                this.hiddenForOpponent = false;
                break;

            case Location.Resource:
                this.controller = this.owner;
                this.exhausted = false;
                this.damage = null;
                this.new = false;
                this.facedown = true;
                this.hiddenForOwner = false;
                this.hiddenForOpponent = true;
                break;

            case Location.Deck:
                this.controller = this.owner;
                this.exhausted = null;
                this.damage = null;
                this.new = false;
                this.facedown = true;
                this.hiddenForOwner = true;
                this.hiddenForOpponent = true;
                break;

            case Location.Hand:
                this.controller = this.owner;
                this.exhausted = null;
                this.damage = null;
                this.new = false;
                this.facedown = false;
                this.hiddenForOwner = false;
                this.hiddenForOpponent = true;
                break;

            case Location.Discard:
            case Location.RemovedFromGame:
            case Location.OutsideTheGame:
            case Location.BeingPlayed:
                this.controller = this.owner;
                this.exhausted = null;
                this.damage = null;
                this.new = false;
                this.facedown = false;
                this.hiddenForOwner = false;
                this.hiddenForOpponent = false;
                break;
            
            default:
                Contract.fail(`Unknown location enum value: ${location}`);
        }
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
    //         (array, attachment) => array.concat(attachment.getEffects(EffectName.AddElementAsAttacker)),
    //         this.getEffects(EffectName.AddElementAsAttacker)
    //     );

    //     if (
    //         elementsAdded.some((element) =>
    //             this.game.rings[element]
    //                 .getEffects(EffectName.CannotDeclareRing)
    //                 .some((match) => match(this.controller))
    //         )
    //     ) {
    //         return false;
    //     }

    //     if (
    //         conflictType === ConflictTypes.Military &&
    //         attackers.reduce((total, card) => total + card.sumEffects(EffectName.CardCostToAttackMilitary), 0) >
    //             this.controller.hand.size()
    //     ) {
    //         return false;
    //     }

    //     let fateCostToAttackProvince = province ? province.getFateCostToAttack() : 0;
    //     if (
    //         attackers.reduce((total, card) => total + card.sumEffects(EffectName.FateCostToAttack), 0) +
    //             fateCostToAttackProvince >
    //         this.controller.fate
    //     ) {
    //         return false;
    //     }
    //     if (this.anyEffect(EffectName.CanOnlyBeDeclaredAsAttackerWithElement)) {
    //         for (let element of this.getEffects(EffectName.CanOnlyBeDeclaredAsAttackerWithElement)) {
    //             if (!ring.hasElement(element) && !elementsAdded.includes(element)) {
    //                 return false;
    //             }
    //         }
    //     }

    //     if (this.controller.anyEffect(EffectName.LimitLegalAttackers)) {
    //         const checks = this.controller.getEffects(EffectName.LimitLegalAttackers);
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
    //         this.location === Location.PlayArea &&
    //         !this.exhausted
    //     );
    // }

    // canDeclareAsDefender(conflictType = this.game.currentConflict.conflictType) {
    //     return (
    //         this.checkRestrictions('declareAsDefender', this.game.getFrameworkContext()) &&
    //         this.canParticipateAsDefender(conflictType) &&
    //         this.location === Location.PlayArea &&
    //         !this.exhausted &&
    //         !this.covert
    //     );
    // }

    // canParticipateAsAttacker(conflictType = this.game.currentConflict.conflictType) {
    //     let effects = this.getEffects(EffectName.CannotParticipateAsAttacker);
    //     return !effects.some((value) => value === 'both' || value === conflictType) && !this.hasDash(conflictType);
    // }

    // canParticipateAsDefender(conflictType = this.game.currentConflict.conflictType) {
    //     let effects = this.getEffects(EffectName.CannotParticipateAsDefender);
    //     let hasDash = conflictType ? this.hasDash(conflictType) : false;

    //     return !effects.some((value) => value === 'both' || value === conflictType) && !hasDash;
    // }

    // bowsOnReturnHome() {
    //     return !this.anyEffect(EffectName.DoesNotBow);
    // }

    setDefaultController(player) {
        this.defaultController = player;
    }

    // getModifiedController() {
    //     if (
    //         this.location === Location.PlayArea ||
    //         (this.type === CardType.Holding && this.location.includes('province'))
    //     ) {
    //         return this.mostRecentEffect(EffectName.TakeControl) || this.defaultController;
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
    //         isPlayableByMe: this.isConflict && this.controller.isCardInPlayableLocation(this, PlayType.PlayFromHand),
    //         isPlayableByOpponent:
    //             this.isConflict &&
    //             this.controller.opponent &&
    //             this.controller.opponent.isCardInPlayableLocation(this, PlayType.PlayFromHand),
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

export = Card;