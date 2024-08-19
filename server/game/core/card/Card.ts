import AbilityHelper from '../../AbilityHelper.js';
import Effects from '../../ongoingEffects/EffectLibrary.js';
import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource.js';
import CardAbility from '../ability/CardAbility.js';
import Game from '../Game.js';
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
    StatType,
    Trait,
    AbilityRestriction,
    LocationFilter
} from '../Constants.js';
import { isArena, cardLocationMatches, checkConvertToEnum } from '../utils/EnumHelpers.js';
import {
    IActionProps,
    // IAttachmentConditionProps,
    IConstantAbilityProps,
    ITriggeredAbilityProps
} from '../../Interfaces.js';
// import { PlayAttachmentAction } from './PlayAttachmentAction.js';
// import { StatusToken } from './StatusToken';
import Player from '../Player.js';
import StatsModifierWrapper from '../ongoingEffect/effectImpl/StatsModifierWrapper.js';
import type { IOngoingCardEffect } from '../ongoingEffect/IOngoingCardEffect.js';
import { PlayUnitAction } from '../../actions/PlayUnitAction.js';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction.js';
import TriggeredAbility from '../ability/TriggeredAbility.js';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility.js';
import PlayerAction from '../ability/PlayerAction.js';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility.js';
import StatsModifier from '../ongoingEffect/effectImpl/StatsModifier.js';

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

interface ICardAbilities {
    // TODO: maybe rethink some of the inheritance tree (specifically for InitiateAttackAction) so that this can be more specific
    action: any[];
    triggered: TriggeredAbility[];
    constant: IConstantAbility[];
    playCardAction: PlayerAction[];
}

// TODO: switch to using mixins for the different card types
class Card extends OngoingEffectSource {
    public controller: Player;
    public override game: Game;

    public static implemented = false;

    public override readonly id: string;
    public readonly printedTitle: string;
    public readonly printedSubtitle: string;
    public readonly internalName: string;
    public readonly defaultArena: Location | null;
    public readonly unique: boolean;
    public readonly printedTypes: Set<CardType>;

    public menu = [
        { command: 'exhaust', text: 'Exhaust/Ready' },
        { command: 'control', text: 'Give control' }
    ];

    // menu: { command: string; text: string }[] = [];

    private showPopup = false;
    private popupMenuText = '';
    public abilities: ICardAbilities = { action: [], triggered: [], constant: [], playCardAction: [] };
    protected traits: string[];
    public location: Location;

    public readonly printedHp: number | null;
    public readonly printedPower: number | null;
    public readonly printedCost: number | null;
    public readonly aspects: Aspect[] = [];

    protected upgrades = [] as Card[];
    protected childCards = [] as Card[];
    protected allowedAttachmentTraits = [] as string[];
    protected printedKeywords: string[] = [];

    // TODO: readonly getters for most of these
    protected defaultController: Player;
    public parent: Card | null;
    public exhausted: boolean | null;
    public damage: number | null;
    public hiddenForController: boolean;
    public hiddenForOpponent: boolean;
    public playedThisTurn: boolean;
    public facedown: boolean;
    public resourced: boolean;

    public get title(): string {
        return this.printedTitle;
    }

    public get types(): Set<CardType> {
        return this.printedTypes;
    }

    /**
     * The union of the card's "Action Abilities" (ie abilities that enable an action, SWU 2.1) and
     * any other general card actions such as playing a card
     */
    public get actions(): any[] {
        return this.getActions();
    }

    /**
     * SWU 6.1: Triggered abilities have bold text indicating their triggering condition, starting with the word
     * “When” or “On”, followed by a colon and an effect. Examples of triggered abilities are “When Played,”
     * “When Defeated,” and “On Attack” abilities
     */
    public get triggeredAbilities(): TriggeredAbility[] {
        return this.getTriggeredAbilities();
    }

    /**
     * "Constant abilities" are any non-triggered passive ongoing abilities (SWU 3.1)
     */
    public get constantAbilities(): IConstantAbility[] {
        return this.getConstantAbilities();
    }

    public get hp(): number | null {
        return this.printedHp == null ? null : this.getModifiedStatValue(StatType.Hp);
    }

    public get baseHp(): number | null {
        return this.printedHp;
    }

    public get power(): number | null {
        return this.printedPower == null ? null : this.getModifiedStatValue(StatType.Power);
    }

    public get basePower(): number | null {
        return this.printedPower;
    }

    public get cost() {
        return this.printedCost;
    }

    public get showStats() {
        return isArena(this.location) && this.isUnit();
    }

    public constructor(
        public owner: Player,
        public cardData: any
    ) {
        super(owner.game);

        this.validateCardData(cardData);

        this.controller = owner;

        this.id = cardData.id;
        this.unique = cardData.unique;

        this.printedTitle = cardData.title;
        this.printedSubtitle = cardData.subtitle;
        this.internalName = cardData.internalName;
        this.printedTypes = new Set(checkConvertToEnum(cardData.types, CardType));
        this.traits = checkConvertToEnum(cardData.traits, Trait);
        this.aspects = checkConvertToEnum(cardData.aspects, Aspect);
        this.printedKeywords = cardData.keywords; // TODO: enum for these

        this.setupCardAbilities(AbilityHelper);
        this.setupPlayAbilities();
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
        this.hiddenForController = true;

        switch (cardData.arena) {
            case 'space':
                this.defaultArena = Location.SpaceArena;
                break;
            case 'ground':
                this.defaultArena = Location.GroundArena;
                break;
            default:
                this.defaultArena = null;
        }

        // if (cardData.type === CardType.Character) {
        //     this.abilities.triggered.push(new CourtesyAbility(this.game, this));
        //     this.abilities.triggered.push(new PrideAbility(this.game, this));
        //     this.abilities.triggered.push(new SincerityAbility(this.game, this));
        // }
        // if (cardData.type === CardType.Attachment) {
        //     this.abilities.triggered.push(new CourtesyAbility(this.game, this));
        //     this.abilities.triggered.push(new SincerityAbility(this.game, this));
        // }
        // if (cardData.isEvent() && this.hasEphemeral()) {
        //     this.eventRegistrarForEphemeral = new EventRegistrar(this.game, this);
        //     this.eventRegistrarForEphemeral.register([{ [EventName.OnCardPlayed]: 'handleEphemeral' }]);
        // }
        // if (this.isDynasty) {
        //     this.abilities.triggered.push(new RallyAbility(this.game, this));
        // }
    }

    private validateCardData(cardData: any) {
        Contract.assertNotNullLike(cardData);
        Contract.assertNotNullLike(cardData.id);
        Contract.assertNotNullLike(cardData.title);
        Contract.assertNotNullLike(cardData.types);
        Contract.assertNotNullLike(cardData.traits);
        Contract.assertNotNullLike(cardData.aspects);
        Contract.assertNotNullLike(cardData.keywords);
        Contract.assertNotNullLike(cardData.unique);

        this.validateImplementationId(cardData);
    }

    // TODO: when we refactor Card we can just make this abstract
    /**
     * If this is a subclass implementation of a specific card, validate that it matches the provided card data
     */
    private validateImplementationId(cardData: any): void {
        const implementationId = this.getImplementationId();
        if (implementationId) {
            if (cardData.id !== implementationId.id || cardData.internalName !== implementationId.internalName) {
                throw new Error(
                    `Implementation { ${implementationId.id}, ${implementationId.internalName} } does not match provided card data { ${cardData.id}, ${cardData.internalName} }`
                );
            }
        }
    }

    /**
     * Subclass implementations for specific cards must override this method and provide the id
     * information for the specific card
     */
    protected getImplementationId(): null | { internalName: string, id: string } {
        return null;
    }

    /**
     * Equivalent to {@link Card.title}
     */
    public override get name(): string {
        return this.title;
    }

    public isEvent(): boolean {
        return this.hasSomeType(CardType.Event);
    }

    public isUnit(): boolean {
        return this.hasSomeType(CardType.Unit);
    }

    public isUpgrade(): boolean {
        return this.hasSomeType(CardType.Upgrade);
    }

    public isBase(): boolean {
        return this.hasSomeType(CardType.Base);
    }

    public isLeader(): boolean {
        return this.hasSomeType(CardType.Leader);
    }

    public isToken(): boolean {
        return this.hasSomeType(CardType.Token);
    }

    public hasEveryType(types: Set<CardType> | CardType | CardType[]): boolean {
        let typesToCheck: Set<CardType> | CardType[];

        if (!(types instanceof Set) && !(types instanceof Array)) {
            typesToCheck = [types];
        } else {
            typesToCheck = types;
        }

        for (const type of typesToCheck) {
            if (!this.types.has(type)) {
                return false;
            }
        }
        return false;
    }

    public hasSomeType(types: Set<CardType> | CardType | CardType[]): boolean {
        let typesToCheck: Set<CardType> | CardType[];

        if (!(types instanceof Set) && !(types instanceof Array)) {
            typesToCheck = [types];
        } else {
            typesToCheck = types;
        }

        for (const type of typesToCheck) {
            if (this.types.has(type)) {
                return true;
            }
        }
        return false;
    }

    private getActions(location = this.location): any[] {
        const allAbilities = this.abilities.action;

        // const lostAllNonKeywordsAbilities = this.anyEffect(EffectName.LoseAllNonKeywordAbilities);
        // if (lostAllNonKeywordsAbilities) {
        //     allAbilities = allAbilities.filter((a) => a.isKeywordAbility());
        // }

        if (this.isUnit()) {
            allAbilities.push(new InitiateAttackAction(this));
        }

        // TODO EVENT: this block prevents any PlayCardAction from being generated for event cards
        // if card is already in play or is an event, return the default actions
        if (isArena(location) || this.isEvent()) {
            return allAbilities;
        }

        // TODO: do we need to explicitly add base / leader actions here?

        // otherwise (i.e. card is in hand), return play card action(s) + other available card actions
        return allAbilities.concat(this.getPlayCardActions());
    }


    private getTriggeredAbilities(): TriggeredAbility[] {
        const triggeredAbilities = this.abilities.triggered;

        // const lostAllNonKeywordsAbilities = this.anyEffect(EffectName.LoseAllNonKeywordAbilities);
        // if (lostAllNonKeywordsAbilities) {
        //     allAbilities = allAbilities.filter((a) => a.isKeywordAbility());
        // }

        return triggeredAbilities;
    }

    private getConstantAbilities(): any[] {
        // const lostAllNonKeywordsAbilities = this.anyEffect(EffectName.LoseAllNonKeywordAbilities);
        // if (lostAllNonKeywordsAbilities) {
        //     let allAbilities = this.abilities.constant.concat(gainedPersistentEffects);
        //     allAbilities = allAbilities.filter((a) => a.isKeywordEffect || a.type === EffectName.AddKeyword);
        //     return allAbilities;
        // }
        return this.isBlank() ? []
            : this.abilities.constant;
    }

    // TODO: make this abstract eventually
    /**
     * Create card abilities by calling subsequent methods with appropriate properties
     * @param {Object} ability - AbilityHelper object containing limits, costs, effects, and game actions
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupCardAbilities(ability) {
    }

    protected setupPlayAbilities() {
        // TODO UPGRADE: add play upgrade here

        // TODO EVENT: this block *also* prevents the PlayCardAction from being generated for event cards
        if (this.isEvent()) {
            return;
        }

        if (this.isUnit()) {
            this.abilities.playCardAction.push(new PlayUnitAction(this));
        }
    }

    protected actionAbility(properties: IActionProps<this>): void {
        this.abilities.action.push(this.createActionAbility(properties));
    }

    private createActionAbility(properties: IActionProps): CardActionAbility {
        properties.cardName = this.title;
        return new CardActionAbility(this.game, this, properties);
    }

    protected triggeredAbility(properties: ITriggeredAbilityProps): void {
        this.abilities.triggered.push(this.createTriggeredAbility(properties));
    }

    protected whenPlayedAbility(properties: Omit<ITriggeredAbilityProps, 'when' | 'aggregateWhen'>): void {
        const triggeredProperties = Object.assign(properties, { when: { onUnitEntersPlay: (event) => event.card === this } });
        this.triggeredAbility(triggeredProperties);
    }

    protected attackAbility(properties:Omit<ITriggeredAbilityProps, 'when' | 'aggregateWhen'>): void {
        const triggeredProperties = Object.assign(properties, { when: { onAttackDeclared: (event) => event.attacker === this } });
        this.triggeredAbility(triggeredProperties);
    }

    private createTriggeredAbility(properties: ITriggeredAbilityProps): TriggeredAbility {
        properties.cardName = this.title;
        return new TriggeredAbility(this.game, this, properties);
    }

    /**
     * Applies an effect that continues as long as the card providing the effect
     * is both in play and not blank.
     */
    protected constantAbility(properties: IConstantAbilityProps<this>): void {
        const allowedLocationFilters = [
            WildcardLocation.Any,
            Location.Discard,
            WildcardLocation.AnyArena,
            Location.Leader,
            Location.Base,
        ];

        const locationFilter = properties.locationFilter || WildcardLocation.AnyArena;

        let notAllowedLocations: LocationFilter[];
        if (Array.isArray(locationFilter)) {
            notAllowedLocations = allowedLocationFilters.filter((location) => locationFilter.includes(location));
        } else {
            notAllowedLocations = allowedLocationFilters.includes(locationFilter) ? [] : [locationFilter];
        }

        if (notAllowedLocations.length > 0) {
            throw new Error(`Illegal effect location(s) specified: '${notAllowedLocations.join(', ')}'`);
        }
        properties.cardName = this.title;
        this.abilities.constant.push({ duration: Duration.Persistent, locationFilter, ...properties });
    }

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

    public hasKeyword(keyword: string): boolean {
        const targetKeyword = keyword.toLowerCase();

        const addKeywordEffects = this.getEffectValues(EffectName.AddKeyword).filter(
            (effectValue: string) => effectValue === targetKeyword
        );
        const loseKeywordEffects = this.getEffectValues(EffectName.LoseKeyword).filter(
            (effectValue: string) => effectValue === targetKeyword
        );

        return addKeywordEffects.length > loseKeywordEffects.length;
    }

    public hasPrintedKeyword(keyword: PrintedKeyword) {
        return this.printedKeywords.includes(keyword);
    }

    public hasTrait(trait: string): boolean {
        return this.hasSomeTrait(trait);
    }

    // TODO: fix the below so they use the same pattern as has*Trait above
    public hasEveryTrait(traits: Set<string>): boolean;
    public hasEveryTrait(...traits: string[]): boolean;
    public hasEveryTrait(traitSetOrFirstTrait: Set<string> | string, ...otherTraits: string[]): boolean {
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

    public hasSomeTrait(traits: Set<string>): boolean;
    public hasSomeTrait(...traits: string[]): boolean;
    public hasSomeTrait(traitSetOrFirstTrait: Set<string> | string, ...otherTraits: string[]): boolean {
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

    public getTraits(): Set<string> {
        return this.getTraitSet();
    }

    public getTraitSet(): Set<string> {
        const set = new Set(
            this.getEffectValues(EffectName.Blank).some((blankTraits: boolean) => blankTraits)
                ? []
                : this.traits
        );

        for (const gainedTrait of this.getEffectValues(EffectName.AddTrait)) {
            set.add(gainedTrait);
        }
        for (const lostTrait of this.getEffectValues(EffectName.LoseTrait)) {
            set.delete(lostTrait);
        }

        return set;
    }

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
    //             effect.registeredEffects = this.addEffectToEngine(effect);
    //         }
    //     }
    // }

    private resetLimits() {
        for (const action of this.abilities.action) {
            if (action.limit) {
                action.limit.reset();
            }
        }
        for (const triggeredAbility of this.abilities.triggered) {
            if (triggeredAbility.limit) {
                triggeredAbility.limit.reset();
            }
        }
    }

    private updateAbilityEvents(from: Location, to: Location, reset: boolean = true) {
        if (reset) {
            this.resetLimits();
        }
        for (const triggeredAbility of this.triggeredAbilities) {
            if (this.isEvent()) {
                // TODO EVENT: this is block is here because the only reaction to register on an event was the bluff window 'reaction', we have real ones now
                if (
                    to === Location.Deck ||
                    this.controller.isCardInPlayableLocation(this) ||
                    (this.controller.opponent && this.controller.opponent.isCardInPlayableLocation(this))
                ) {
                    triggeredAbility.registerEvents();
                } else {
                    triggeredAbility.unregisterEvents();
                }
            } else if (cardLocationMatches(to, triggeredAbility.location) && !cardLocationMatches(from, triggeredAbility.location)) {
                triggeredAbility.registerEvents();
            } else if (!cardLocationMatches(to, triggeredAbility.location) && cardLocationMatches(from, triggeredAbility.location)) {
                triggeredAbility.unregisterEvents();
            }
        }
    }

    private updateEffects(from: Location, to: Location) {
        // removing any lasting effects from ourself
        if (!isArena(from) && !isArena(to)) {
            this.removeLastingEffects();
        }

        // TODO: is this needed for upgrades?
        // this.updateStatusTokenEffects();

        // check to register / unregister any effects that we are the source of
        for (const constantAbility of this.constantAbilities) {
            if (constantAbility.locationFilter === WildcardLocation.Any) {
                continue;
            }
            if (
                !cardLocationMatches(from, constantAbility.locationFilter) &&
                cardLocationMatches(to, constantAbility.locationFilter)
            ) {
                constantAbility.registeredEffects = this.addEffectToEngine(constantAbility);
            } else if (
                cardLocationMatches(from, constantAbility.locationFilter) &&
                !cardLocationMatches(to, constantAbility.locationFilter)
            ) {
                this.removeEffectFromEngine(constantAbility.registeredEffects);
                constantAbility.registeredEffects = [];
            }
        }
    }

    protected updateConstantAbilityContexts() {
        for (const constantAbility of this.constantAbilities) {
            if (constantAbility.registeredEffects) {
                for (const effect of constantAbility.registeredEffects) {
                    effect.refreshContext();
                }
            }
        }
    }

    public moveTo(targetLocation: Location) {
        const originalLocation = this.location;

        if (originalLocation === targetLocation) {
            return;
        }

        this.location = targetLocation;
        this.setDefaultStatusForLocation(targetLocation);

        if (originalLocation !== targetLocation) {
            this.updateAbilityEvents(originalLocation, targetLocation);
            this.updateEffects(originalLocation, targetLocation);
            this.game.emitEvent(EventName.OnCardMoved, {
                card: this,
                originalLocation: originalLocation,
                newLocation: targetLocation
            });
        }
    }

    public canTriggerAbilities(context: AbilityContext, ignoredRequirements = []): boolean {
        return (
            !this.facedown &&
            (ignoredRequirements.includes('triggeringRestrictions') ||
                !this.hasRestriction(AbilityRestriction.TriggerAbilities, context))
        );
    }

    public canInitiateKeywords(context: AbilityContext): boolean {
        return !this.facedown && !this.hasRestriction(AbilityRestriction.InitiateKeywords, context);
    }

    public getModifiedAbilityLimitMax(player: Player, ability: CardAbility, max: number): number {
        const effects = this.getEffects().filter((effect) => effect.type === EffectName.IncreaseLimitOnAbilities);
        let total = max;
        effects.forEach((effect) => {
            const value = effect.getValue(this);
            const applyingPlayer = value.applyingPlayer || effect.context.player;
            const targetAbility = value.targetAbility;
            if ((!targetAbility || targetAbility === ability) && applyingPlayer === player) {
                total++;
            }
        });

        return total;
    }

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

    public isBlank(): boolean {
        return this.anyEffect(EffectName.Blank);
    }

    public override hasRestriction(actionType, context: AbilityContext): boolean {
        const player = (context && context.player) || this.controller;
        return (
            super.hasRestriction(actionType, context) ||
            player.hasRestriction(actionType, context)
        );
    }

    // getReactions(): any[] {
    //     return this.triggeredAbilities.slice();
    // }

    public readiesDuringReadyPhase(): boolean {
        return !this.anyEffect(EffectName.DoesNotReady);
    }

    // hideWhenFacedown(): boolean {
    //     return !this.anyEffect(EffectName.CanBeSeenWhenFacedown);
    // }

    // TODO: would something like this be helpful for swu?
    public parseKeywords(text: string) {
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
        //     this.persistentEffect({ effect: AbilityHelper.effects.addKeyword(keyword) });
        // }
    }

    // isAttachmentBonusModifierSwitchActive() {
    //     const switches = this.getEffectValues(EffectName.SwitchAttachmentSkillModifiers).filter(Boolean);
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
    //             effect: AbilityHelper.effects.attachmentMilitarySkillModifier(() =>
    //                 this.isAttachmentBonusModifierSwitchActive() ? politicalBonus : militaryBonus
    //             )
    //         });
    //     }
    //     if (!isNaN(politicalBonus)) {
    //         this.persistentEffect({
    //             match: (card) => card === this.parent,
    //             targetController: RelativePlayer.Any,
    //             effect: AbilityHelper.effects.attachmentPoliticalSkillModifier(() =>
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
    //     for (const effectCard of this.getEffectValues(EffectName.CannotHaveOtherRestrictedAttachments)) {
    //         for (const card of this.upgrades) {
    //             if (card.isRestricted() && card !== effectCard) {
    //                 illegalAttachments.add(card);
    //             }
    //         }
    //     }

    //     const attachmentLimits = this.upgrades.filter((card) => card.anyEffect(EffectName.AttachmentLimit));
    //     for (const card of attachmentLimits) {
    //         let limit = Math.max(...card.getEffectValues(EffectName.AttachmentLimit));
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
    //         (array, card) => array.concat(card.getEffectValues(EffectName.AttachmentRestrictTraitAmount)),
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
    public canPlayOn(card) {
        return true;
    }

    /**
     * Checks 'no attachment' restrictions for this card when attempting to
     * attach the passed attachment card.
     */
    public allowAttachment(attachment) {
        if (this.allowedAttachmentTraits.some((trait) => attachment.hasTrait(trait))) {
            return true;
        }

        return this.isBlank() || this.allowedAttachmentTraits.length === 0;
    }

    protected getPlayCardActions() {
        const actions = this.abilities.playCardAction.slice();

        return actions;
    }

    /**
     * This removes an attachment from this card's attachment Array.  It doesn't open any windows for
     * game effects to respond to.
     * @param {Card} attachment
     */
    public removeAttachment(attachment) {
        this.upgrades = this.upgrades.filter((card) => card.uuid !== attachment.uuid);
    }

    protected addChildCard(card, location) {
        this.childCards.push(card);
        this.controller.moveCard(card, location);
    }

    protected removeChildCard(card, location) {
        if (!card) {
            return;
        }

        this.childCards = this.childCards.filter((a) => a !== card);
        this.controller.moveCard(card, location);
    }

    // TODO: is this correct handling of hidden cards? not sure how this integrates with the client
    public override getShortSummaryForControls(activePlayer: Player): any {
        if (!this.isHiddenForPlayer(activePlayer)) {
            return { hidden: true };
        }
        return super.getShortSummaryForControls(activePlayer);
    }

    public isResource() {
        return this.location === Location.Resource;
    }

    public isHiddenForPlayer(player: Player) {
        switch (player) {
            case this.controller:
                return this.hiddenForController;
            case this.controller.opponent:
                return this.hiddenForOpponent;
            default:
                Contract.fail(`Unknown player: ${player}`);
                return false;
        }
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
    //         types: this.types,
    //         isDishonored: this.isDishonored,
    //         isHonored: this.isHonored,
    //         isTainted: !!this.isTainted,
    //         uuid: this.uuid
    //     };

    //     return Object.assign(state, selectionState);
    // }

    // --------------------------- TODO: type annotations for all of the below --------------------------

    // this will be helpful if we ever get a card where a stat that is 'X, where X is ...'
    public getPrintedStat(type: StatType) {
        switch (type) {
            case StatType.Power:
                return this.cardData.power === null || this.cardData.power === undefined
                    ? NaN
                    : isNaN(parseInt(this.cardData.power))
                        ? 0
                        : parseInt(this.cardData.power);
            case StatType.Hp:
                return this.cardData.hp === null || this.cardData.hp === undefined
                    ? NaN
                    : isNaN(parseInt(this.cardData.hp))
                        ? 0
                        : parseInt(this.cardData.hp);
            default:
                Contract.fail(`Unknown stat enum value: ${type}`);
                return null;
        }
    }

    public addDamage(amount: number) {
        if (
            !Contract.assertNotNullLikeOrNan(this.damage) ||
            !Contract.assertNotNullLikeOrNan(this.hp) ||
            !Contract.assertNonNegative(amount)
        ) {
            return;
        }

        if (amount === 0) {
            return;
        }

        this.damage += amount;

        // TODO EFFECTS: the win and defeat effects should almost certainly be handled elsewhere, probably in a game state check
        if (this.damage >= this.hp) {
            if (this === this.owner.base as Card) {
                this.game.recordWinner(this.owner.opponent, 'base destroyed');
            } else {
                this.owner.defeatCard(this);
            }
        }
    }

    /** @returns True if any damage was healed, false otherwise */
    public removeDamage(amount: number): boolean {
        if (
            !Contract.assertNotNullLikeOrNan(this.damage) ||
            !Contract.assertNotNullLikeOrNan(this.hp) ||
            !Contract.assertNonNegative(amount)
        ) {
            return false;
        }

        if (amount === 0 || this.damage === 0) {
            return false;
        }

        this.damage -= Math.min(amount, this.damage);
        return true;
    }

    private getModifiedStatValue(statType: StatType, floor = true, excludeModifiers = []) {
        const wrappedModifiers = this.getWrappedStatModifiers(excludeModifiers);

        const baseStatValue = statType === StatType.Hp ? this.printedHp : this.printedPower;
        const stat = wrappedModifiers.reduce((total, wrappedModifier) => total + wrappedModifier.modifier[statType], baseStatValue);
        if (isNaN(stat)) {
            return 0;
        }

        // TODO EFFECTS: need a check around here somewhere to defeat the unit if effects have brought hp to 0

        return floor ? Math.max(0, stat) : stat;
    }

    // TODO: add a summary method that logs these modifiers (i.e., the names, amounts, etc.)
    private getWrappedStatModifiers(exclusions) {
        if (!exclusions) {
            exclusions = [];
        }

        let rawEffects;
        if (typeof exclusions === 'function') {
            rawEffects = this.getEffects().filter((effect) => !exclusions(effect));
        } else {
            rawEffects = this.getEffects().filter((effect) => !exclusions.includes(effect.type));
        }

        const modifierEffects: IOngoingCardEffect[] = rawEffects.filter((effect) => effect.type === EffectName.ModifyStats);
        const wrappedStatsModifiers = modifierEffects.map((modifierEffect) => StatsModifierWrapper.fromEffect(modifierEffect, this));

        return wrappedStatsModifiers;
    }

    // *******************************************************************************************************
    // ************************************** DECKCARD.JS ****************************************************
    // *******************************************************************************************************

    private costLessThan(num) {
        const cost = this.printedCost;
        return num && (cost || cost === 0) && cost < num;
    }

    public anotherUniqueInPlay(player) {
        return (
            this.unique &&
            this.game.allCards.some(
                (card) =>
                    card.isInPlay() &&
                    card.printedName === this.printedTitle && // TODO: also check subtitle
                    card !== this &&
                    (card.owner === player || card.controller === player || card.owner === this.owner)
            )
        );
    }

    public anotherUniqueInPlayControlledBy(player) {
        return (
            this.unique &&
            this.game.allCards.some(
                (card) =>
                    card.isInPlay() &&
                    card.printedName === this.printedTitle &&
                    card !== this &&
                    card.controller === player
            )
        );
    }

    // createSnapshot() {
    //     const clone = new Card(this.owner, this.cardData);

    //     // clone.upgrades = _(this.upgrades.map((attachment) => attachment.createSnapshot()));
    //     clone.childCards = this.childCards.map((card) => card.createSnapshot());
    //     clone.effects = [...this.effects];
    //     clone.controller = this.controller;
    //     clone.exhausted = this.exhausted;
    //     // clone.statusTokens = [...this.statusTokens];
    //     clone.location = this.location;
    //     clone.parent = this.parent;
    //     clone.aspects = [...this.aspects];
    //     // clone.fate = this.fate;
    //     // clone.inConflict = this.inConflict;
    //     clone.traits = Array.from(this.getTraits());
    //     clone.uuid = this.uuid;
    //     return clone;
    // }

    // TODO UPGRADES: these status token modifier methods could be reused for upgrades
    // getStatusTokenSkill() {
    //     const modifiers = this.getStatusTokenModifiers();
    //     const skill = modifiers.reduce((total, modifier) => total + modifier.amount, 0);
    //     if (isNaN(skill)) {
    //         return 0;
    //     }
    //     return skill;
    // }

    // getStatusTokenModifiers() {
    //     let modifiers = [];
    //     let modifierEffects = this.getEffects().filter((effect) => effect.type === EffectName.ModifyBothSkills);

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
    //     for (const effect of this.getEffects() as OngoingCardEffect[]) {
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

    public exhaust() {
        this.exhausted = true;
    }

    public ready() {
        this.exhausted = false;
    }

    public canPlay(context, type) {
        return (
            !this.hasRestriction(type, context) &&
            !context.player.hasRestriction(type, context) &&
            !this.hasRestriction(AbilityRestriction.Play, context) &&
            !context.player.hasRestriction(AbilityRestriction.Play, context)
        );
    }

    /**
     * Deals with the engine effects of leaving play, making sure all statuses are removed. Anything which changes
     * the state of the card should be here. This is also called in some strange corner cases e.g. for attachments
     * which aren't actually in play themselves when their parent (which is in play) leaves play.
     *
     * Note that a card becoming a resource is _not_ leaving play.
     */
    public leavesPlay() {
        // // If this is an attachment and is attached to another card, we need to remove all links between them
        // if (this.parent && this.parent.attachments) {
        //     this.parent.removeAttachment(this);
        //     this.parent = null;
        // }

        // TODO: reuse this for capture logic
        // // Remove any cards underneath from the game
        // const cardsUnderneath = this.controller.getCardPile(this.uuid).map((a) => a);
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
    private setDefaultStatusForLocation(location: Location) {
        switch (location) {
            case Location.SpaceArena:
            case Location.GroundArena:
                this.controller = this.owner;
                this.exhausted = this.isUnit() ? true : null;
                this.damage = this.isUnit() ? 0 : null;
                this.playedThisTurn = false;
                this.facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = false;
                break;

            case Location.Base:
            case Location.Leader:
                this.controller = this.owner;
                this.exhausted = this.isLeader() ? false : null;
                this.damage = this.isBase() ? 0 : null;
                this.playedThisTurn = false;
                this.facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = false;
                break;

            case Location.Resource:
                this.controller = this.owner;
                this.exhausted = false;
                this.damage = null;
                this.playedThisTurn = false;
                this.facedown = true;
                this.hiddenForController = false;
                this.hiddenForOpponent = true;
                break;

            case Location.Deck:
                this.controller = this.owner;
                this.exhausted = null;
                this.damage = null;
                this.playedThisTurn = false;
                this.facedown = true;
                this.hiddenForController = true;
                this.hiddenForOpponent = true;
                break;

            case Location.Hand:
                this.controller = this.owner;
                this.exhausted = null;
                this.damage = null;
                this.playedThisTurn = false;
                this.facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = true;
                break;

            case Location.Discard:
            case Location.RemovedFromGame:
            case Location.OutsideTheGame:
            case Location.BeingPlayed:
                this.controller = this.owner;
                this.exhausted = null;
                this.damage = null;
                this.playedThisTurn = false;
                this.facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = false;
                break;

            default:
                Contract.fail(`Unknown location enum value: ${location}`);
        }
    }

    public setDefaultController(player) {
        this.defaultController = player;
    }

    public getModifiedController() {
        if (isArena(this.location)) {
            return this.mostRecentEffect(EffectName.TakeControl) || this.defaultController;
        }
        return this.owner;
    }

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
