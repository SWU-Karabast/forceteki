import { IActionAbilityProps } from '../../Interfaces';
import { ActionAbility } from '../ability/ActionAbility';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import type Player from '../Player';
import Contract from '../utils/Contract';
import { AbilityRestriction, AbilityType, Arena, Aspect, CardType, EffectName, EventName, KeywordName, Location, Trait } from '../Constants';
import * as EnumHelpers from '../utils/EnumHelpers';
import AbilityHelper from '../../AbilityHelper';
import * as Helpers from '../utils/Helpers';
import { AbilityContext } from '../ability/AbilityContext';
import CardAbility from '../ability/CardAbility';
import { KeywordInstance } from '../ability/KeywordInstance';
import * as KeywordHelpers from '../ability/KeywordHelpers';

// required for mixins to be based on this class
export type CardConstructor = new (...args: any[]) => Card;

export interface IAbilityInitializer {
    abilityType: AbilityType,
    initialize: () => void
}

/**
 * The base class for all card types. Any shared properties among all cards will be present here.
 *
 * To access properties / methods of specific subclass types, use check methods such as {@link Card.isUnit}
 * or {@link Card.canBeExhausted} to confirm that the card has the expected properties and then cast
 * to the specific card type or one of the union types in `CardTypes.js` as needed.
 */
export class Card extends OngoingEffectSource {
    public static implemented = false;

    public readonly aspects: Aspect[] = [];
    public readonly internalName: string;
    public readonly subtitle?: string;
    public readonly title: string;
    public readonly unique: boolean;

    public controller: Player;

    protected override readonly id: string;
    protected readonly printedKeywords: KeywordInstance[];
    protected readonly printedTraits: Set<Trait>;
    protected readonly printedType: CardType;

    protected abilityInitializers: IAbilityInitializer[] = [];
    protected _actionAbilities: ActionAbility[] = [];
    protected _controller: Player;
    protected defaultController: Player;
    protected _facedown = true;
    protected hiddenForController = true;      // TODO: is this correct handling of hidden / visible card state? not sure how this integrates with the client
    protected hiddenForOpponent = true;

    private _location: Location;


    // ******************************************** PROPERTY GETTERS ********************************************
    public get facedown(): boolean {
        return this._facedown;
    }

    public get keywords(): KeywordInstance[] {
        return this.getKeywords();
    }

    public get location(): Location {
        return this._location;
    }

    public get traits(): Set<Trait> {
        return this.getTraits();
    }

    public get type(): CardType {
        return this.printedType;
    }

    // *********************************************** CONSTRUCTOR ***********************************************
    public constructor(
        public readonly owner: Player,
        private readonly cardData: any
    ) {
        super(owner.game, cardData.title);

        this.validateCardData(cardData);
        this.validateImplementationId(cardData);

        this.aspects = EnumHelpers.checkConvertToEnum(cardData.aspects, Aspect);
        this.internalName = cardData.internalName;
        this.subtitle = cardData.subtitle;
        this.title = cardData.title;
        this.unique = cardData.unique;

        this.controller = owner;
        this.defaultController = owner;
        this.id = cardData.id;
        this.printedKeywords = KeywordHelpers.parseKeywords(cardData.keywords, cardData.text, this.internalName);
        this.printedTraits = new Set(EnumHelpers.checkConvertToEnum(cardData.traits, Trait));
        this.printedType = Card.buildTypeFromPrinted(cardData.types);

        this._location = Location.Deck;

        this.setupCardAbilities(AbilityHelper);
        this.activateAbilityInitializersForTypes(AbilityType.Action);
    }


    // ******************************************* ABILITY GETTERS *******************************************
    /**
     * `SWU 7.2.1`: An action ability is an ability indicated by the bolded word “Action.” Most action
     * abilities have a cost in brackets that must be paid in order to use the ability.
     */
    public getActionAbilities(): ActionAbility[] {
        return this.isBlank() ? []
            : this._actionAbilities
                .concat(this.getGainedAbilityEffects<ActionAbility>(AbilityType.Action));
    }

    /**
     * Any actions that a player could legally invoke with this card as the source. This includes "default"
     * actions such as playing a card or attacking, as well as any action abilities from card text.
     */
    public getActions(): PlayerOrCardAbility[] {
        return this.isBlank() ? []
            : this.getActionAbilities();
    }


    // **************************************** INITIALIZATION HELPERS ****************************************
    public static buildTypeFromPrinted(printedTypes: string[]): CardType {
        if (printedTypes.length === 2) {
            if (printedTypes[0] !== 'token') {
                throw new Error(`Unexpected card types: ${printedTypes}`);
            }

            switch (printedTypes[1]) {
                case 'unit':
                    return CardType.TokenUnit;
                case 'upgrade':
                    return CardType.TokenUpgrade;
                default:
                    throw new Error(`Unexpected token types: ${printedTypes}`);
            }
        }

        Contract.assertArraySize(printedTypes, 1, `Unexpected card types: ${printedTypes}`);
        switch (printedTypes[0]) {
            case 'event':
                return CardType.Event;
            case 'unit':
                return CardType.NonLeaderUnit;
            case 'leader':
                return CardType.Leader;
            case 'base':
                return CardType.Base;
            case 'upgrade':
                return CardType.Upgrade;
            default:
                throw new Error(`Unexpected card type: ${printedTypes[0]}`);
        }
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
    }

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

    protected unpackConstructorArgs(...args: any[]): [Player, any] {
        Contract.assertArraySize(args, 2);

        return [args[0] as Player, args[1]];
    }

    /**
     * Create card abilities by calling subsequent methods with appropriate properties
     * @param {Object} ability - AbilityHelper object containing limits, costs, effects, and game actions
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupCardAbilities(ability) {
    }

    /**
     * Works through the list of queued ability initializers and activates any for the corresponding type.
     * We need to initialize this way because subclass ability initializers might be called before their
     * constructors have executed, so we have to delay execution of their initializers until they're ready.
     */
    protected activateAbilityInitializersForTypes(abilityTypes: AbilityType | AbilityType[]) {
        const abilityTypesAra = Helpers.asArray(abilityTypes);

        const skippedInitializers: IAbilityInitializer[] = [];
        for (const abilityInitializer of this.abilityInitializers) {
            if (abilityTypesAra.includes(abilityInitializer.abilityType)) {
                abilityInitializer.initialize();
            } else {
                skippedInitializers.push(abilityInitializer);
            }
        }
        this.abilityInitializers = skippedInitializers;
    }

    protected addActionAbility(properties: IActionAbilityProps<this>) {
        this.abilityInitializers.push({
            abilityType: AbilityType.Action,
            initialize: () => this._actionAbilities.push(this.createActionAbility(properties))
        });
    }

    public createActionAbility(properties: IActionAbilityProps): ActionAbility {
        properties.cardName = this.title;
        return new ActionAbility(this.game, this, properties);
    }


    // ******************************************* CARD TYPE HELPERS *******************************************
    // TODO: convert these to use ts type narrowing for simpler conversions to derived types (see https://www.typescriptlang.org/docs/handbook/2/classes.html#this-based-type-guards)
    public isEvent(): boolean {
        return this.type === CardType.Event;
    }

    public isUnit(): boolean {
        return this.type === CardType.NonLeaderUnit || this.type === CardType.LeaderUnit;
    }

    public isUpgrade(): boolean {
        return this.type === CardType.Upgrade || this.type === CardType.TokenUpgrade;
    }

    public isBase(): boolean {
        return this.type === CardType.Base;
    }

    public isLeader(): boolean {
        return this.type === CardType.Leader || this.type === CardType.LeaderUnit;
    }

    public isLeaderUnit(): boolean {
        return this.type === CardType.LeaderUnit;
    }

    public isNonLeaderUnit(): boolean {
        return this.type === CardType.NonLeaderUnit;
    }

    public isToken(): boolean {
        return this.type === CardType.TokenUnit || this.type === CardType.TokenUpgrade;
    }

    /** Returns true if the card is in a location where it can legally be damaged */
    public canBeDamaged(): boolean {
        return false;
    }

    /** Returns true if the card is in a location where it can legally be exhausted */
    public canBeExhausted(): boolean {
        return false;
    }

    /** Returns true if the card is a type that can legally have triggered abilities */
    public canRegisterTriggeredAbilities(): boolean {
        return false;
    }

    /** Returns true if the card is a type that can legally have constant abilities */
    public canRegisterConstantAbilities(): boolean {
        return false;
    }


    // ******************************************* KEYWORD HELPERS *******************************************
    /** Helper method for {@link Card.keywords} */
    private getKeywords() {
        let keywords = [...this.printedKeywords];

        // TODO: this is currently wrong, lost keywords should be able to be re-added by later effects
        for (const gainedKeyword of this.getEffectValues(EffectName.GainKeyword)) {
            keywords.push(gainedKeyword);
        }
        for (const lostKeyword of this.getEffectValues(EffectName.LoseKeyword)) {
            keywords = keywords.filter((keyword) => keyword.name === lostKeyword);
        }

        return keywords;
    }

    public hasSomeKeyword(keywords: Set<KeywordName> | KeywordName | KeywordName[]): boolean {
        return this.hasSome(keywords, this.keywords.map((keyword) => keyword.name));
    }

    public hasEveryKeyword(keywords: Set<KeywordName> | KeywordName[]): boolean {
        return this.hasEvery(keywords, this.keywords.map((keyword) => keyword.name));
    }


    // ******************************************* TRAIT HELPERS *******************************************
    /** Helper method for {@link Card.traits} */
    private getTraits() {
        const traits = new Set(
            this.getEffectValues(EffectName.Blank).some((blankTraits: boolean) => blankTraits)
                ? []
                : this.printedTraits
        );

        for (const gainedTrait of this.getEffectValues(EffectName.AddTrait)) {
            traits.add(gainedTrait);
        }
        for (const lostTrait of this.getEffectValues(EffectName.LoseTrait)) {
            traits.delete(lostTrait);
        }

        return traits;
    }

    public hasSomeTrait(traits: Set<Trait> | Trait | Trait[]): boolean {
        return this.hasSome(traits, this.traits);
    }

    public hasEveryTrait(traits: Set<Trait> | Trait[]): boolean {
        return this.hasEvery(traits, this.traits);
    }


    // *************************************** EFFECT HELPERS ***************************************
    public isBlank(): boolean {
        return this.hasEffect(EffectName.Blank);
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

    protected getGainedAbilityEffects<TAbility>(abilityType: AbilityType): TAbility[] {
        return this.getEffectValues(EffectName.GainAbility).filter((ability) => ability.type === abilityType);
    }


    // ******************************************* LOCATION MANAGEMENT *******************************************
    public moveTo(targetLocation: Location) {
        const originalLocation = this.location;

        if (originalLocation === targetLocation) {
            return;
        }

        const prevLocation = this._location;
        this._location = targetLocation;
        this.initializeForCurrentLocation(prevLocation);

        this.game.emitEvent(EventName.OnCardMoved, {
            card: this,
            originalLocation: originalLocation,
            newLocation: targetLocation
        });
    }

    /**
     * Deals with the engine effects of entering a new location, making sure all statuses are set with legal values.
     * If a card should have a different status on entry (e.g., readied instead of exhausted), call this method first
     * and then update the card state(s) as needed.
     *
     * Subclass methods should override this and call the super method to ensure all statuses are set correctly.
     */
    protected initializeForCurrentLocation(prevLocation: Location) {
        switch (this.location) {
            case Location.SpaceArena:
            case Location.GroundArena:
                this.controller = this.owner;
                this._facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = false;
                break;

            case Location.Base:
            case Location.Leader:
                this.controller = this.owner;
                this._facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = false;
                break;

            case Location.Resource:
                this.controller = this.owner;
                this._facedown = true;
                this.hiddenForController = false;
                this.hiddenForOpponent = true;
                break;

            case Location.Deck:
                this.controller = this.owner;
                this._facedown = true;
                this.hiddenForController = true;
                this.hiddenForOpponent = true;
                break;

            case Location.Hand:
                this.controller = this.owner;
                this._facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = true;
                break;

            case Location.Discard:
            case Location.RemovedFromGame:
            case Location.OutsideTheGame:
                this.controller = this.owner;
                this._facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = false;
                break;

            default:
                Contract.fail(`Unknown location enum value: ${this.location}`);
        }
    }

    // ******************************************* MISC *******************************************
    protected assertPropertyEnabled(propertyVal: any, propertyName: string) {
        Contract.assertNotNullLike(propertyVal, `Attempting to read property '${propertyName}' on '${this.internalName}' but it is in location '${this.location}' where the property does not apply`);
    }

    protected resetLimits() {
        for (const action of this._actionAbilities) {
            if (action.limit) {
                action.limit.reset();
            }
        }
    }

    public setDefaultController(player) {
        this.defaultController = player;
    }

    public getModifiedController() {
        if (EnumHelpers.isArena(this.location)) {
            return this.mostRecentEffect(EffectName.TakeControl) || this.defaultController;
        }
        return this.owner;
    }

    public isResource() {
        return this.location === Location.Resource;
    }

    // TODO: should we break this out into variants for event (Play) vs other (EnterPlay)?
    public canPlay(context, type) {
        return (
            !this.hasRestriction(type, context) &&
            !context.player.hasRestriction(type, context) &&
            !this.hasRestriction(AbilityRestriction.Play, context) &&
            !context.player.hasRestriction(AbilityRestriction.Play, context) &&
            !this.hasRestriction(AbilityRestriction.EnterPlay, context) &&
            !context.player.hasRestriction(AbilityRestriction.EnterPlay, context)
        );
    }

    /** @deprecated Copied from L5R, not yet updated for SWU rules */
    public anotherUniqueInPlay(player) {
        return (
            this.unique &&
            this.game.allCards.some(
                (card) =>
                    card.isInPlay() &&
                    card.title === this.title &&
                    card !== this &&
                    (card.owner === player || card.controller === player || card.owner === this.owner)
            )
        );
    }

    /** @deprecated Copied from L5R, not yet updated for SWU rules */
    public anotherUniqueInPlayControlledBy(player) {
        return (
            this.unique &&
            this.game.allCards.some(
                (card) =>
                    card.isInPlay() &&
                    card.title === this.title &&
                    card !== this &&
                    card.controller === player
            )
        );
    }

    private hasSome<T>(valueOrValuesToCheck: T | Set<T> | T[], cardValues: Set<T> | T[]): boolean {
        const valuesToCheck = this.asSetOrArray(valueOrValuesToCheck);
        const cardValuesContains = Array.isArray(cardValues)
            ? (value: T) => cardValues.includes(value)
            : (value: T) => cardValues.has(value);

        for (const value of valuesToCheck) {
            if (cardValuesContains(value)) {
                return true;
            }
        }
        return false;
    }

    private hasEvery<T>(valueOrValuesToCheck: T | Set<T> | T[], cardValues: Set<T> | T[]): boolean {
        const valuesToCheck = this.asSetOrArray(valueOrValuesToCheck);
        const cardValuesContains = Array.isArray(cardValues)
            ? (value: T) => cardValues.includes(value)
            : (value: T) => cardValues.has(value);

        for (const value of valuesToCheck) {
            if (!cardValuesContains(value)) {
                return false;
            }
        }
        return false;
    }

    private asSetOrArray<T>(valueOrValuesToCheck: T | Set<T> | T[]): Set<T> | T[] {
        if (!(valueOrValuesToCheck instanceof Set) && !(valueOrValuesToCheck instanceof Array)) {
            return [valueOrValuesToCheck];
        }
        return valueOrValuesToCheck;
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

    /**
     * Deals with the engine effects of leaving play, making sure all statuses are removed. Anything which changes
     * the state of the card should be here. This is also called in some strange corner cases e.g. for upgrades
     * which aren't actually in play themselves when their parent (which is in play) leaves play.
     */
    public leavesPlay() {
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

    // TODO: is this actually helpful?
    // isInPlay(): boolean {
    //     if (this.isFacedown()) {
    //         return false;
    //     }
    //     if ([CardType.Holding, CardType.Province, CardType.Stronghold].includes(this.type)) {
    //         return this.isInProvince();
    //     }
    //     return this.location === Location.PlayArea;
    // }

    // TODO CAPTURE: will probably need to leverage or modify the below "child card" methods (see basecard.ts in L5R for reference)
    // originally these were for managing province cards

    // protected addChildCard(card, location) {
    //     this.childCards.push(card);
    //     this.controller.moveCard(card, location);
    // }

    // protected removeChildCard(card, location) {
    //     if (!card) {
    //         return;
    //     }

    //     this.childCards = this.childCards.filter((a) => a !== card);
    //     this.controller.moveCard(card, location);
    // }

    // createSnapshot() {
    //     const clone = new Card(this.owner, this.cardData);

    //     // clone.upgrades = _(this.upgrades.map((attachment) => attachment.createSnapshot()));
    //     clone.childCards = this.childCards.map((card) => card.createSnapshot());
    //     clone.effects = [...this.effects];
    //     clone.controller = this.controller;
    //     clone.exhausted = this.exhausted;
    //     // clone.statusTokens = [...this.statusTokens];
    //     clone.location = this.location;
    //     clone.parentCard = this.parentCard;
    //     clone.aspects = [...this.aspects];
    //     // clone.fate = this.fate;
    //     // clone.inConflict = this.inConflict;
    //     clone.traits = Array.from(this.getTraits());
    //     clone.uuid = this.uuid;
    //     return clone;
    // }

    // getSummary(activePlayer, hideWhenFaceup) {
    //     let isActivePlayer = activePlayer === this.controller;
    //     let selectionState = activePlayer.getCardSelectionState(this);

    //     // This is my facedown card, but I'm not allowed to look at it
    //     // OR This is not my card, and it's either facedown or hidden from me
    //     if (
    //         isActivePlayer
    //             ? this.isFacedown() && this.hideWhenFacedown()
    //             : this.isFacedown() || hideWhenFaceup || this.hasEffect(EffectName.HideWhenFaceUp)
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


    public override getShortSummaryForControls(activePlayer: Player): any {
        if (!this.isHiddenForPlayer(activePlayer)) {
            return { hidden: true };
        }
        return super.getShortSummaryForControls(activePlayer);
    }

    private isHiddenForPlayer(player: Player) {
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
}