import { IActionAbilityProps } from '../../Interfaces';
import { CardActionAbility } from '../ability/CardActionAbility';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import TriggeredAbility from '../ability/TriggeredAbility';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import type Player from '../Player';
import Contract from '../utils/Contract';
import Card from './Card';
import { AbilityRestriction, CardType, EffectName, EventName, Keyword, Location, Trait } from '../Constants';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { checkConvertToEnum, isArena } from '../utils/EnumHelpers';

export type CardConstructor = new (...args: any[]) => NewCard;

export class NewCard extends OngoingEffectSource {
    public readonly subtitle?: string;
    public readonly title: string;
    public readonly unique: boolean;

    public controller?: Player = null;

    protected override readonly id: string;
    protected readonly printedKeywords: Set<Keyword>;   // TODO KEYWORDS: enum of keywords
    protected readonly printedTraits: Set<Trait>;
    protected readonly printedTypes: Set<CardType>;

    protected defaultActions: PlayerOrCardAbility[] = [];
    protected defaultController: Player;
    protected hiddenForController = false;      // TODO: is this correct handling of hidden / visible card state? not sure how this integrates with the client
    protected hiddenForOpponent = false;
    protected _upgrades: Card[] = [];

    private _location: Location;

    /**
     * The union of the card's "Action Abilities" (i.e. abilities that enable an action, `SWU 7.2.1`)
     * and any other general card actions such as playing a card
     */
    public get actions() {
        return this.isBlank() ? []
            : this.defaultActions;
    }

    public get location() {
        return this._location;
    }

    public get types(): Set<CardType> {
        return this.printedTypes;
    }

    public get upgrades(): Card[] {
        return this._upgrades;
    }

    public constructor(
        public readonly owner: Player,
        private readonly cardData: any
    ) {
        super(owner.game);

        this.validateCardData(cardData);
        this.validateImplementationId(cardData);

        this.subtitle = cardData.subtitle;
        this.title = cardData.title;
        this.unique = cardData.unique;

        this.id = cardData.id;
        this.printedTraits = new Set(checkConvertToEnum(cardData.traits, Trait));
        this.printedTypes = new Set(checkConvertToEnum(cardData.types, CardType));

        this.defaultController = owner;
    }


    // **************************************** INITIALIZATION HELPERS ****************************************
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

    // TODO THIS PR: remove this
    protected generateOriginalCard() {
        return new Card(this.owner, this.cardData);
    }

    protected unpackConstructorArgs(...args: any[]): [Player, any] {
        Contract.assertArraySize(args, 2);

        return [args[0] as Player, args[1]];
    }


    // ******************************************* CARD TYPE HELPERS *******************************************
    public isEvent(): boolean {
        return false;
    }

    public isUnit(): boolean {
        return false;
    }

    public isUpgrade(): boolean {
        return false;
    }

    public isBase(): boolean {
        return false;
    }

    public isLeader(): boolean {
        return false;
    }

    public isLeaderUnit(): boolean {
        return false;
    }

    public isNonLeaderUnit(): boolean {
        return false;
    }

    public isToken(): boolean {
        return false;
    }

    public hasSomeType(types: Set<CardType> | CardType | CardType[]): boolean {
        return this.hasSome(types, this.types);
    }

    public hasEveryType(types: Set<CardType> | CardType[]): boolean {
        return this.hasEvery(types, this.types);
    }


    // ******************************************* KEYWORD HELPERS *******************************************
    public get keywords() {
        const keywords = this.printedKeywords;

        for (const gainedTrait of this.getEffectValues(EffectName.AddKeyword)) {
            keywords.add(gainedTrait);
        }
        for (const lostTrait of this.getEffectValues(EffectName.LoseKeyword)) {
            keywords.delete(lostTrait);
        }

        return keywords;
    }

    // TODO THIS PR: remove this
    public hasKeyword(keyword: Keyword): boolean {
        const targetKeyword = keyword.valueOf().toLowerCase();

        const addKeywordEffects = this.getEffectValues(EffectName.AddKeyword).filter(
            (effectValue: Keyword) => effectValue === targetKeyword
        );
        const loseKeywordEffects = this.getEffectValues(EffectName.LoseKeyword).filter(
            (effectValue: Keyword) => effectValue === targetKeyword
        );

        return addKeywordEffects.length > loseKeywordEffects.length;
    }

    // TODO THIS PR: remove this
    public hasPrintedKeyword(keyword: Keyword) {
        return this.printedKeywords.has(keyword);
    }

    public hasSomeKeyword(keywords: Set<Keyword> | Keyword | Keyword[]): boolean {
        return this.hasSome(keywords, this.keywords);
    }

    public hasEveryKeyword(keywords: Set<Keyword> | Keyword[]): boolean {
        return this.hasEvery(keywords, this.keywords);
    }


    // ******************************************* TRAIT HELPERS *******************************************
    public get traits() {
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

    // TODO THIS PR: remove this
    public hasTrait(trait: Trait): boolean {
        return this.hasSomeTrait(trait);
    }

    public hasSomeTrait(traits: Set<Trait> | Trait | Trait[]): boolean {
        return this.hasSome(traits, this.traits);
    }

    public hasEveryTrait(traits: Set<Trait> | Trait[]): boolean {
        return this.hasEvery(traits, this.traits);
    }


    // *************************************** EFFECT HELPERS ***************************************
    public isBlank(): boolean {
        return this.anyEffect(EffectName.Blank);
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
        // TODO THIS PR: figure out how to implement playedThisTurn and facedown. might need more mixins
        switch (this.location) {
            case Location.SpaceArena:
            case Location.GroundArena:
                this.controller = this.owner;
                // this.playedThisTurn = false;
                // this.facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = false;
                break;

            case Location.Base:
            case Location.Leader:
                this.controller = this.owner;
                // this.playedThisTurn = false;
                // this.facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = false;
                break;

            case Location.Resource:
                this.controller = this.owner;
                // this.playedThisTurn = false;
                // this.facedown = true;
                this.hiddenForController = false;
                this.hiddenForOpponent = true;
                break;

            case Location.Deck:
                this.controller = this.owner;
                // this.playedThisTurn = false;
                // this.facedown = true;
                this.hiddenForController = true;
                this.hiddenForOpponent = true;
                break;

            case Location.Hand:
                this.controller = this.owner;
                // this.playedThisTurn = false;
                // this.facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = true;
                break;

            case Location.Discard:
            case Location.RemovedFromGame:
            case Location.OutsideTheGame:
            case Location.BeingPlayed:
                this.controller = this.owner;
                // this.playedThisTurn = false;
                // this.facedown = false;
                this.hiddenForController = false;
                this.hiddenForOpponent = false;
                break;

            default:
                Contract.fail(`Unknown location enum value: ${this.location}`);
        }
    }

    // TODO UPGRADES: this whole section
    // *************************************** UPGRADE HELPERS ***************************************
    /**
     * Checks whether an attachment can be played on a given card.  Intended to be
     * used by cards inheriting this class
     */
    public canPlayOn(card) {
        return true;
    }

    /**
     * This removes an attachment from this card's attachment Array.  It doesn't open any windows for
     * game effects to respond to.
     * @param {Card} attachment
     */
    public removeAttachment(attachment) {
        this._upgrades = this.upgrades.filter((card) => card.uuid !== attachment.uuid);
    }

    // /**
    //  * Checks 'no attachment' restrictions for this card when attempting to
    //  * attach the passed attachment card.
    //  */
    // public allowAttachment(attachment) {
    //     if (this.allowedAttachmentTraits.some((trait) => attachment.hasTrait(trait))) {
    //         return true;
    //     }

    //     return this.isBlank() || this.allowedAttachmentTraits.length === 0;
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


    // ******************************************* MISC *******************************************
    public setDefaultController(player) {
        this.defaultController = player;
    }

    // TODO THIS PR: switch to using "Helper.*" form for stuff like isArena
    public getModifiedController() {
        if (isArena(this.location)) {
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

    private hasSome<T>(valueOrValuesToCheck: T | Set<T> | T[], cardValues: Set<T>): boolean {
        const valuesToCheck = this.asSetOrArray(valueOrValuesToCheck);

        for (const value of valuesToCheck) {
            if (cardValues.has(value)) {
                return true;
            }
        }
        return false;
    }

    private hasEvery<T>(valueOrValuesToCheck: T | Set<T> | T[], cardValues: Set<T>): boolean {
        const valuesToCheck = this.asSetOrArray(valueOrValuesToCheck);

        for (const value of valuesToCheck) {
            if (!cardValues.has(value)) {
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
    //     clone.parent = this.parent;
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