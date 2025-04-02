import type { IActionAbilityProps, IConstantAbilityProps, ISetId, Zone, ITriggeredAbilityProps } from '../../Interfaces';
import { ActionAbility } from '../ability/ActionAbility';
import type PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import type { IOngoingEffectSourceState } from '../ongoingEffect/OngoingEffectSource';
import { OngoingEffectSource } from '../ongoingEffect/OngoingEffectSource';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import type { MoveZoneDestination } from '../Constants';
import { KeywordName } from '../Constants';
import { AbilityRestriction, Aspect, CardType, Duration, EffectName, EventName, ZoneName, DeckZoneDestination, RelativePlayer, Trait, WildcardZoneName, WildcardRelativePlayer } from '../Constants';
import * as EnumHelpers from '../utils/EnumHelpers';
import type { AbilityContext } from '../ability/AbilityContext';
import type { CardAbility } from '../ability/CardAbility';
import type Shield from '../../cards/01_SOR/tokens/Shield';
import type { KeywordInstance, KeywordWithCostValues } from '../ability/KeywordInstance';
import * as KeywordHelpers from '../ability/KeywordHelpers';
import type { StateWatcherRegistrar } from '../stateWatcher/StateWatcherRegistrar';
import { v4 as uuidv4 } from 'uuid';
import type { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import TriggeredAbility from '../ability/TriggeredAbility';
import type { ICardWithDamageProperty } from './propertyMixins/Damage';
import type { IEventCard } from './EventCard';
import type { IUnitCard } from './propertyMixins/UnitProperties';
import type { IBaseCard } from './BaseCard';
import type { IDeployableLeaderCard, ILeaderUnitCard } from './LeaderUnitCard';
import type { IDoubleSidedLeaderCard } from './DoubleSidedLeaderCard';
import type { IPlayableCard, IPlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';
import type { ITokenCard } from './propertyMixins/Token';
import type { ITokenUnitCard, ITokenUpgradeCard } from './TokenCards';
import type { IInPlayCard } from './baseClasses/InPlayCard';
import type { ICardWithCostProperty } from './propertyMixins/Cost';
import type { INonLeaderUnitCard } from './NonLeaderUnitCard';
import type { ICardCanChangeControllers, IUpgradeCard } from './CardInterfaces';
import type { ILeaderCard } from './propertyMixins/LeaderProperties';
import type { ICardWithTriggeredAbilities } from './propertyMixins/TriggeredAbilityRegistration';
import type { ICardDataJson } from '../../../utils/cardData/CardDataInterfaces';
import type { ICardWithActionAbilities } from './propertyMixins/ActionAbilityRegistration';
import type { ICardWithConstantAbilities } from './propertyMixins/ConstantAbilityRegistration';
import type { GameObjectRef } from '../GameObjectBase';

// required for mixins to be based on this class
export type CardConstructor<T extends ICardState = ICardState> = new (...args: any[]) => Card<T>;

export interface ICardState extends IOngoingEffectSourceState {

    facedown: boolean;
    hiddenForController: boolean;
    hiddenForOpponent: boolean;

    controllerRef: GameObjectRef<Player>;

    zone: GameObjectRef<Zone> | null;
    movedFromZone: ZoneName | null;
    nextAbilityIdx: number;
}

export enum InitializeCardStateOption {
    Initialize = 'initialize',
    DoNotInitialize = 'doNotInitialize',
    ForceInitialize = 'forceInitialize'
}

/**
 * The base class for all card types. Any shared properties among all cards will be present here.
 *
 * To access properties / methods of specific subclass types, use check methods such as {@link Card.isUnit}
 * or {@link Card.canBeExhausted} to confirm that the card has the expected properties and then cast
 * to the specific card type or one of the union types in `CardTypes.js` as needed.
 */
export class Card<T extends ICardState = ICardState> extends OngoingEffectSource<T> {
    public static checkHasNonKeywordAbilityText(cardData: ICardDataJson) {
        if (cardData.types.includes('leader')) {
            return true;
        }

        for (const abilityText of [cardData.text, cardData.pilotText]) {
            if (abilityText == null) {
                continue;
            }

            const abilityLines = abilityText.split('\n');

            // bounty and coordinate keywords always require explicit implementation so we omit them from here
            const keywords = Object.values(KeywordName)
                .filter((keyword) => keyword !== KeywordName.Bounty && keyword !== KeywordName.Coordinate);

            for (const abilityLine of abilityLines) {
                if (abilityLine.trim().length === 0) {
                    continue;
                }

                const lowerCaseAbilityLine = abilityLine.toLowerCase();

                if (keywords.some((keyword) => lowerCaseAbilityLine.startsWith(keyword))) {
                    continue;
                }

                return true;
            }
        }

        return false;
    }

    protected readonly _aspects: Aspect[] = [];
    protected readonly _backSideAspects?: Aspect[];
    protected readonly _backSideTitle?: string;
    protected readonly _internalName: string;
    protected readonly _subtitle?: string;
    protected readonly _title: string;
    protected readonly _unique: boolean;

    protected readonly canBeUpgrade: boolean;
    protected readonly hasNonKeywordAbilityText: boolean;
    protected readonly hasImplementationFile: boolean;
    protected readonly overrideNotImplemented: boolean = false;
    protected readonly printedKeywords: KeywordInstance[];
    protected readonly printedTraits: Set<Trait>;
    protected readonly printedType: CardType;

    protected actionAbilities: ActionAbility[] = [];
    protected constantAbilities: IConstantAbility[] = [];
    protected disableWhenDefeatedCheck = false;
    protected triggeredAbilities: TriggeredAbility[] = [];

    protected get hiddenForController() {
        return this.state.hiddenForController;
    }

    protected get hiddenForOpponent() {
        return this.state.hiddenForOpponent;
    }

    protected get movedFromZone() {
        return this.state.movedFromZone;
    }

    protected set movedFromZone(value: ZoneName | null) {
        this.state.movedFromZone = value;
    }


    // ******************************************** PROPERTY GETTERS ********************************************
    public get aspects(): Aspect[] {
        return this._aspects;
    }

    public get backSideAspects(): Aspect[] {
        return this._backSideAspects;
    }

    public get backSideTitle(): string {
        return this._backSideTitle;
    }

    public get controller(): Player {
        return this.game.gameObjectManager.get(this.state.controllerRef);
    }

    protected set controller(value: Player) {
        this.state.controllerRef = value.getRef();
    }

    public get facedown(): boolean {
        return this.state.facedown;
    }

    public get internalName(): string {
        return this._internalName;
    }

    public get keywords(): KeywordInstance[] {
        return this.getKeywords();
    }

    public get subtitle(): string {
        return this._subtitle;
    }

    public get title(): string {
        return this._title;
    }

    public get unique(): boolean {
        return this._unique;
    }

    /** @deprecated use title instead**/
    public override get name() {
        return super.name;
    }

    public get setId(): ISetId {
        return this.cardData.setId;
    }

    public get traits(): Set<Trait> {
        return this.getTraits();
    }

    public get type(): CardType {
        return this.getType();
    }

    /** This method is needed due to a bug in TypeScript with mix-ins and getters */
    protected getType(): CardType {
        return this.printedType;
    }

    public get zone(): Zone | null {
        return this.state.zone ? this.game.gameObjectManager.get(this.state.zone) : null;
    }

    protected set zone(zone: Zone | null) {
        this.state.zone = zone?.getRef();
    }

    public get zoneName(): ZoneName {
        return this.zone?.name;
    }

    // *********************************************** CONSTRUCTOR ***********************************************
    public constructor(
        public readonly owner: Player,
        private readonly cardData: any
    ) {
        super(owner.game, cardData.title);

        this.validateCardData(cardData);

        const implementationId = this.getImplementationId();
        this.hasImplementationFile = implementationId !== null;
        if (implementationId) {
            this.validateImplementationId(implementationId, cardData);
        }

        this.hasNonKeywordAbilityText = this.isLeader() || Card.checkHasNonKeywordAbilityText(cardData);

        this._aspects = EnumHelpers.checkConvertToEnum(cardData.aspects, Aspect);
        this._backSideAspects = cardData.backSideAspects;
        this._internalName = cardData.internalName;
        this._subtitle = cardData.subtitle;
        this._title = cardData.title;
        this._backSideTitle = cardData.backSideTitle;
        this._unique = cardData.unique;

        this.controller = owner;
        this.id = cardData.id;
        this.canBeUpgrade = cardData.upgradeHp != null && cardData.upgradePower != null;
        this.printedTraits = new Set(EnumHelpers.checkConvertToEnum(cardData.traits, Trait));
        this.printedType = Card.buildTypeFromPrinted(cardData.types);

        // TODO: add validation that if the card has the Piloting trait, the right cardData properties are set
        this.printedKeywords = KeywordHelpers.parseKeywords(
            this,
            cardData.keywords,
            this.printedType === CardType.Leader ? cardData.deployBox : cardData.text,
            cardData.pilotText
        );

        // repeat keyword parsing for pilot ability text if present
        if (this.printedType === CardType.Leader) {
            this.printedKeywords.push(
                ...KeywordHelpers.parseKeywords(
                    this,
                    cardData.keywords,
                    cardData.text,
                    cardData.pilotText
                )
            );
        }

        this.setupStateWatchers(this.owner.game.stateWatcherRegistrar);
        this.initializeStateForAbilitySetup();
    }

    protected override setupDefaultState() {
        super.setupDefaultState();

        this.state.facedown = true;
        this.state.hiddenForController = false;
        this.state.hiddenForOpponent = false;
        this.state.movedFromZone = null;
    }

    // ******************************************* ABILITY GETTERS *******************************************
    /**
     * `SWU 7.2.1`: An action ability is an ability indicated by the bolded word “Action.” Most action
     * abilities have a cost in brackets that must be paid in order to use the ability.
     */
    public getActionAbilities(): ActionAbility[] {
        const deduplicatedActionAbilities: ActionAbility[] = [];

        // Add any gained action abilities, deduplicating by any identical gained action abilities from
        // the same source card (e.g., two Heroic Resolve actions)
        const seenCardNameSources = new Set<string>();
        for (const action of this.actionAbilities) {
            if (action.printedAbility) {
                deduplicatedActionAbilities.push(action);
            } else if (!seenCardNameSources.has(action.gainAbilitySource.internalName)) {
                deduplicatedActionAbilities.push(action);
                seenCardNameSources.add(action.gainAbilitySource.internalName);
            }
        }

        return deduplicatedActionAbilities;
    }

    /**
     * `SWU 7.3.1`: A constant ability is always in effect while the card it is on is in play. Constant abilities
     * don’t have any special text styling
     */
    public getConstantAbilities(): IConstantAbility[] {
        return this.constantAbilities;
    }

    /**
     * Any actions that a player could legally invoke with this card as the source. This includes "default"
     * actions such as playing a card or attacking, as well as any action abilities from card text.
     */
    public getActions(): PlayerOrCardAbility[] {
        return this.getActionAbilities();
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
                return CardType.BasicUnit;
            case 'leader':
                return CardType.Leader;
            case 'base':
                return CardType.Base;
            case 'upgrade':
                return CardType.BasicUpgrade;
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
    private validateImplementationId(implementationId: { internalName: string; id: string }, cardData: any): void {
        if (cardData.id !== implementationId.id || cardData.internalName !== implementationId.internalName) {
            throw new Error(
                `Provided card data { ${cardData.id}, ${cardData.internalName} } does not match the data from the card class: { ${implementationId.id}, ${implementationId.internalName} }. Confirm that you are matching the card data to the right card implementation class.`
            );
        }
    }

    /**
     * Subclass implementations for specific cards must override this method and provide the id
     * information for the specific card
     */
    protected getImplementationId(): null | { internalName: string; id: string } {
        return null;
    }

    protected unpackConstructorArgs(...args: any[]): [Player, any] {
        Contract.assertArraySize(args, 2);

        return [args[0] as Player, args[1]];
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupStateWatchers(registrar: StateWatcherRegistrar) {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected initializeStateForAbilitySetup() {
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected validateCardAbilities(cardText: string) {
    }

    // ******************************************* ABILITY HELPERS *******************************************
    public createActionAbility<TSource extends Card = this>(properties: IActionAbilityProps<TSource>): ActionAbility {
        return new ActionAbility(this.game, this, Object.assign(this.buildGeneralAbilityProps('action'), properties));
    }

    public createConstantAbility<TSource extends Card = this>(properties: IConstantAbilityProps<TSource>): IConstantAbility {
        const sourceZoneFilter = properties.sourceZoneFilter || WildcardZoneName.AnyArena;

        return {
            duration: Duration.Persistent,
            sourceZoneFilter,
            ...properties,
            ...this.buildGeneralAbilityProps('constant'),
            uuid: uuidv4()
        };
    }

    protected createTriggeredAbility<TSource extends Card = this>(properties: ITriggeredAbilityProps<TSource>): TriggeredAbility {
        return new TriggeredAbility(this.game, this, Object.assign(this.buildGeneralAbilityProps('triggered'), properties));
    }

    protected buildGeneralAbilityProps(abilityTypeDescriptor: string) {
        return {
            cardName: this.title,

            // example: "wampa_triggered_0"
            abilityIdentifier: `${this.internalName}_${abilityTypeDescriptor}_${this.getNextAbilityIdx()}`,
        };
    }

    /** Increments the ability index counter used for adding an index number to an ability's ID */
    private getNextAbilityIdx() {
        this.state.nextAbilityIdx++;
        return this.state.nextAbilityIdx - 1;
    }


    // ******************************************* CARD TYPE HELPERS *******************************************
    public isEvent(): this is IEventCard {
        return this.type === CardType.Event;
    }

    public isUnit(): this is IUnitCard {
        return EnumHelpers.isUnit(this.type);
    }

    public isUpgrade(): this is IUpgradeCard {
        return EnumHelpers.isUpgrade(this.type);
    }

    public isBase(): this is IBaseCard {
        return this.type === CardType.Base;
    }

    public isDeployableLeader(): this is IDeployableLeaderCard {
        return false;
    }

    public isDoubleSidedLeader(): this is IDoubleSidedLeaderCard {
        return false;
    }

    public isLeader(): this is ILeaderCard {
        return false;
    }

    public isLeaderUnit(): this is ILeaderUnitCard {
        return false;
    }

    public isNonLeaderUnit(): this is INonLeaderUnitCard {
        return false;
    }

    public isToken(): this is ITokenCard {
        return false;
    }

    public isTokenUnit(): this is ITokenUnitCard {
        return false;
    }

    public isTokenUpgrade(): this is ITokenUpgradeCard {
        return false;
    }

    public isPlayable(): this is IPlayableCard {
        return false;
    }

    public canChangeController(): this is ICardCanChangeControllers {
        return false;
    }

    public isShield(): this is Shield {
        return false;
    }

    /** Returns true if the card is of a type that can legally be damaged. Note that the card might still be in a zone where damage is not legal. */
    public canBeDamaged(): this is ICardWithDamageProperty {
        return false;
    }

    /**
     * Returns true if the card is in a zone where it can legally be exhausted.
     * The returned type set is equivalent to {@link CardWithExhaustProperty}.
     */
    public canBeExhausted(): this is IPlayableOrDeployableCard {
        return false;
    }

    public hasCost(): this is ICardWithCostProperty {
        return false;
    }

    /**
     * Returns true if the card is a type that can legally have triggered abilities.
     */
    public canRegisterActionAbilities(): this is ICardWithActionAbilities {
        return false;
    }

    /**
     * Returns true if the card is a type that can legally have triggered abilities.
     */
    public canRegisterConstantAbilities(): this is ICardWithConstantAbilities {
        return false;
    }

    /**
     * Returns true if the card is a type that can legally have triggered abilities.
     */
    public canRegisterTriggeredAbilities(): this is ICardWithTriggeredAbilities {
        return false;
    }

    /**
     * Returns true if the card is a type that can be put into play and considered "in play."
     * The returned type set is equivalent to {@link InPlayCard}.
     */
    public canBeInPlay(): this is IInPlayCard {
        return false;
    }


    // ******************************************* KEYWORD HELPERS *******************************************
    /** Helper method for {@link Card.keywords} */
    protected getKeywords() {
        let keywordInstances = [...this.printedKeywords];
        const gainKeywordEffects = this.getOngoingEffects()
            .filter((ongoingEffect) => ongoingEffect.type === EffectName.GainKeyword);

        for (const effect of gainKeywordEffects) {
            const keywordProps = effect.getValue(this);

            if (Array.isArray(keywordProps)) {
                for (const props of keywordProps) {
                    keywordInstances.push(KeywordHelpers.keywordFromProperties(props, this));
                }
            } else {
                keywordInstances.push(KeywordHelpers.keywordFromProperties(keywordProps, this));
            }
        }

        keywordInstances = keywordInstances.filter((instance) => !instance.isBlank);

        return keywordInstances;
    }

    public getKeywordsWithCostValues(keywordName: KeywordName): KeywordWithCostValues[] {
        const keywords = this.getKeywords().filter((keyword) => keyword.valueOf() === keywordName);

        const keywordsWithoutCostValues = keywords.filter((keyword) => !keyword.hasCostValue());
        Contract.assertTrue(keywordsWithoutCostValues.length === 0, 'Found at least one keyword with missing cost values');

        return keywords as KeywordWithCostValues[];
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
        const traits = new Set(this.printedTraits);

        for (const gainedTrait of this.getOngoingEffectValues(EffectName.AddTrait)) {
            traits.add(gainedTrait);
        }
        for (const lostTrait of this.getOngoingEffectValues(EffectName.LoseTrait)) {
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


    // ******************************************* ASPECT HELPERS *******************************************
    public hasSomeAspect(aspects: Set<Aspect> | Aspect | Aspect[]): boolean {
        return this.hasSome(aspects, this.aspects);
    }

    public hasEveryAspect(aspects: Set<Aspect> | Aspect[]): boolean {
        return this.hasEvery(aspects, this.aspects);
    }


    // *************************************** EFFECT HELPERS ***************************************
    public isBlank(): boolean {
        return this.hasOngoingEffect(EffectName.Blank);
    }

    public canTriggerAbilities(context: AbilityContext, ignoredRequirements = []): boolean {
        return (
            (ignoredRequirements.includes('triggeringRestrictions') ||
              !this.hasRestriction(AbilityRestriction.TriggerAbilities, context))
        );
    }

    public canInitiateKeywords(context: AbilityContext): boolean {
        return !this.facedown && !this.hasRestriction(AbilityRestriction.InitiateKeywords, context);
    }


    // ******************************************* ZONE MANAGEMENT *******************************************
    /**
     * Moves a card to a new zone, optionally resetting the card's controller back to its owner.
     *
     * @param targetZoneName Zone to move to
     */
    public moveTo(targetZoneName: MoveZoneDestination, initializeCardState: InitializeCardStateOption = InitializeCardStateOption.Initialize) {
        Contract.assertNotNullLike(this.state.zone, `Attempting to move card ${this.internalName} before initializing zone`);

        const prevZone = this.zoneName;
        const resetController = EnumHelpers.zoneMoveRequiresControllerReset(prevZone, targetZoneName);

        // if we're moving to deck top / bottom, don't bother checking if we're already in the zone
        if (!([DeckZoneDestination.DeckBottom, DeckZoneDestination.DeckTop] as MoveZoneDestination[]).includes(targetZoneName)) {
            const originalZone = this.zone;
            const moveToZone = (resetController ? this.owner : this.controller)
                .getZone(EnumHelpers.asConcreteZone(targetZoneName));

            if (originalZone === moveToZone) {
                // in ForceInitialize mode, we need to reinitialize the card even if it hasn't moved (e.g. ejected pilot)
                if (initializeCardState === InitializeCardStateOption.ForceInitialize) {
                    this.initializeForCurrentZone(this.zoneName);
                }

                return;
            }
        }

        this.removeFromCurrentZone();

        if (resetController) {
            this.controller = this.owner;
        }

        this.addSelfToZone(targetZoneName);

        this.postMoveSteps(prevZone, initializeCardState);
    }

    protected removeFromCurrentZone() {
        if (this.zone.name === ZoneName.Base) {
            Contract.assertTrue(this.isLeader(), `Attempting to move card ${this.internalName} from ${this.zone}`);
            this.zone.removeLeader();
        } else {
            this.zone.removeCard(this);
        }
    }

    protected postMoveSteps(movedFromZone: ZoneName, initializeCardState: InitializeCardStateOption = InitializeCardStateOption.Initialize) {
        if (initializeCardState === InitializeCardStateOption.Initialize || initializeCardState === InitializeCardStateOption.ForceInitialize) {
            this.initializeForCurrentZone(movedFromZone);
        }

        this.game.emitEvent(EventName.OnCardMoved, null, {
            card: this,
            originalZone: movedFromZone,
            newZone: this.zoneName
        });

        this.registerMove(movedFromZone);
    }

    protected registerMove(movedFromZone: ZoneName) {
        this.game.registerMovedCard(this);
    }

    public initializeZone(zone: Zone) {
        Contract.assertIsNullLike(this.state.zone, `Attempting to initialize zone for card ${this.internalName} to ${zone.name} but it is already set`);

        this.zone = zone;

        this.initializeForStartZone();
        this.initializeForCurrentZone(null);
    }


    protected initializeForStartZone(): void {
        this.controller = this.owner;
    }

    private addSelfToZone(zoneName: MoveZoneDestination) {
        switch (zoneName) {
            case ZoneName.Base:
                this.zone = this.owner.baseZone;
                Contract.assertTrue(this.isLeader());
                this.zone.setLeader(this);
                break;

            case DeckZoneDestination.DeckBottom:
            case DeckZoneDestination.DeckTop:
                this.zone = this.owner.deckZone;
                Contract.assertTrue(this.isPlayable());
                this.zone.addCard(this, zoneName);
                break;

            case ZoneName.Discard:
                this.zone = this.owner.discardZone;
                Contract.assertTrue(this.isPlayable());
                this.zone.addCard(this);
                break;

            case ZoneName.GroundArena:
                this.zone = this.game.groundArena;
                Contract.assertTrue(this.canBeInPlay());
                this.zone.addCard(this);
                break;

            case ZoneName.Hand:
                this.zone = this.owner.handZone;
                Contract.assertTrue(this.isPlayable());
                this.zone.addCard(this);
                break;

            case ZoneName.OutsideTheGame:
                this.zone = this.owner.outsideTheGameZone;
                Contract.assertTrue(this.isToken() || this.isPlayable());
                this.zone.addCard(this);
                break;

            case ZoneName.Resource:
                this.zone = this.controller.resourceZone;
                Contract.assertTrue(this.isPlayable());
                this.zone.addCard(this);
                break;

            case ZoneName.SpaceArena:
                this.zone = this.game.spaceArena;
                Contract.assertTrue(this.canBeInPlay());
                this.zone.addCard(this);
                break;

            default:
                Contract.fail(`Unknown zone enum value: ${zoneName}`);
        }
    }

    /**
     * Updates the card's abilities for its current zone after being moved.
     * Called from {@link Game.resolveGameState} after event resolution.
     */

    public resolveAbilitiesForNewZone() {
        // TODO: do we need to consider a case where a card is moved from one arena to another,
        // where we maybe wouldn't reset events / effects / limits?
        this.updateActionAbilitiesForZone(this.movedFromZone, this.zoneName);
        this.updateTriggeredAbilitiesForZone(this.movedFromZone, this.zoneName);
        this.updateConstantAbilityEffects(this.movedFromZone, this.zoneName);
        this.updateKeywordAbilityEffects(this.movedFromZone, this.zoneName);

        this.movedFromZone = null;
    }

    protected updateActionAbilitiesForZone(from: ZoneName, to: ZoneName) {
        this.updateActionAbilitiesForZoneInternal(this.actionAbilities, from, to);
    }

    protected updateActionAbilitiesForZoneInternal(actionAbilities: ActionAbility[], from: ZoneName, to: ZoneName) {
        if (!EnumHelpers.isArena(from) || !EnumHelpers.isArena(to)) {
            for (const action of actionAbilities) {
                if (action.limit) {
                    action.limit.reset();
                }
            }
        }
    }

    protected updateTriggeredAbilitiesForZone(from: ZoneName, to: ZoneName) {
        this.updateTriggeredAbilityEventsInternal(this.triggeredAbilities, from, to);
    }

    protected updateTriggeredAbilityEventsInternal(triggeredAbilities: TriggeredAbility[], from: ZoneName, to: ZoneName) {
        if (!EnumHelpers.isArena(from) || !EnumHelpers.isArena(to)) {
            for (const triggeredAbility of triggeredAbilities) {
                if (triggeredAbility.limit) {
                    triggeredAbility.limit.reset();
                }
            }
        }

        for (const triggeredAbility of triggeredAbilities) {
            if (EnumHelpers.cardZoneMatches(to, triggeredAbility.zoneFilter) && !EnumHelpers.cardZoneMatches(from, triggeredAbility.zoneFilter)) {
                triggeredAbility.registerEvents();
            } else if (!EnumHelpers.cardZoneMatches(to, triggeredAbility.zoneFilter) && EnumHelpers.cardZoneMatches(from, triggeredAbility.zoneFilter)) {
                triggeredAbility.unregisterEvents();
            }
        }
    }

    protected updateConstantAbilityEffects(from: ZoneName, to: ZoneName) {
        this.updateConstantAbilityEffectsInternal(this.constantAbilities, from, to);
    }

    protected updateConstantAbilityEffectsInternal(constantAbilities: IConstantAbility[], from: ZoneName, to: ZoneName, allowIdempotentUnregistration = false) {
        if (!EnumHelpers.isArena(to) || from === ZoneName.Discard || from === ZoneName.Capture) {
            this.removeLastingEffects();
        }

        for (const constantAbility of constantAbilities) {
            if (constantAbility.sourceZoneFilter === WildcardZoneName.Any) {
                continue;
            }
            if (
                !EnumHelpers.cardZoneMatches(from, constantAbility.sourceZoneFilter) &&
                EnumHelpers.cardZoneMatches(to, constantAbility.sourceZoneFilter)
            ) {
                constantAbility.registeredEffects = this.addEffectToEngine(constantAbility);
            } else if (
                EnumHelpers.cardZoneMatches(from, constantAbility.sourceZoneFilter) &&
                !EnumHelpers.cardZoneMatches(to, constantAbility.sourceZoneFilter)
            ) {
                const registeredEffects = constantAbility.registeredEffects;
                if (!registeredEffects) {
                    Contract.assertTrue(allowIdempotentUnregistration, `Attempting to unregister effects for constant ability ${constantAbility.title} on ${this.internalName} but it is not registered`);
                    continue;
                }

                this.removeEffectFromEngine(constantAbility.registeredEffects);
                constantAbility.registeredEffects = [];
            }
        }
    }

    /** Register / un-register the effects for any abilities from keywords */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected updateKeywordAbilityEffects(from: ZoneName, to: ZoneName) { }


    /**
     * Deals with the engine effects of entering a new zone, making sure all statuses are set with legal values.
     * If a card should have a different status on entry (e.g., readied instead of exhausted), call this method first
     * and then update the card state(s) as needed.
     *
     * Subclass methods should override this and call the super method to ensure all statuses are set correctly.
     */
    protected initializeForCurrentZone(prevZone?: ZoneName) {
        this.state.hiddenForOpponent = EnumHelpers.isHiddenFromOpponent(this.zoneName, RelativePlayer.Self);

        switch (this.zoneName) {
            case ZoneName.SpaceArena:
            case ZoneName.GroundArena:
                this.state.facedown = false;
                this.state.hiddenForController = false;
                break;

            case ZoneName.Base:
                this.state.facedown = false;
                this.state.hiddenForController = false;
                break;

            case ZoneName.Resource:
                this.state.facedown = true;
                this.state.hiddenForController = false;
                break;

            case ZoneName.Deck:
                this.state.facedown = true;
                this.state.hiddenForController = true;
                break;

            case ZoneName.Hand:
                this.state.facedown = false;
                this.state.hiddenForController = false;
                break;

            case ZoneName.Capture:
                this.state.facedown = true;
                this.state.hiddenForController = false;
                break;

            case ZoneName.Discard:
            case ZoneName.OutsideTheGame:
                this.state.facedown = false;
                this.state.hiddenForController = false;
                break;

            default:
                Contract.fail(`Unknown zone enum value: ${this.zoneName}`);
        }
    }

    // ******************************************* MISC *******************************************
    public override isCard(): this is Card {
        return true;
    }

    protected assertPropertyEnabledForZone(propertyVal: any, propertyName: string) {
        Contract.assertNotNullLike(propertyVal, this.buildPropertyDisabledForZoneStr(propertyName));
    }

    protected assertPropertyEnabledForZoneBoolean(enabled: boolean, propertyName: string) {
        Contract.assertTrue(enabled, this.buildPropertyDisabledForZoneStr(propertyName));
    }

    private buildPropertyDisabledForZoneStr(propertyName: string) {
        return `Attempting to read property '${propertyName}' on '${this.internalName}' but it is in zone '${this.zoneName}' where the property does not apply`;
    }

    public isResource() {
        return this.zoneName === ZoneName.Resource;
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
                (card: any) =>
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
                (card: any) =>
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
        const effects = this.getOngoingEffects().filter((effect) => effect.type === EffectName.IncreaseLimitOnAbilities);
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

    // createSnapshot() {
    //     const clone = new Card(this.owner, this.cardData);

    //     // clone.upgrades = _(this.upgrades.map((attachment) => attachment.createSnapshot()));
    //     clone.childCards = this.childCards.map((card) => card.createSnapshot());
    //     clone.effects = [...this.effects];
    //     clone.controller = this.controller;
    //     clone.exhausted = this.exhausted;
    //     // clone.statusTokens = [...this.statusTokens];
    //     clone.zoneName = this.zoneName;
    //     clone.parentCard = this.parentCard;
    //     clone.aspects = [...this.aspects];
    //     // clone.fate = this.fate;
    //     // clone.inConflict = this.inConflict;
    //     clone.traits = Array.from(this.getTraits());
    //     clone.uuid = this.uuid;
    //     return clone;
    // }


    // TODO: Clean this up and review rules for visibility. We can probably reduce this down to arity 1
    /*
    * This is the infomation for each card that is sent to the client.
    */

    public getSummary(activePlayer: Player): any {
        const isActivePlayer = activePlayer === this.controller;
        const selectionState = activePlayer.getCardSelectionState(this);

        // If it is not the active player and in opposing hand or deck - return facedown card
        if (this.zone.hiddenForPlayers === WildcardRelativePlayer.Any || (!isActivePlayer && this.zone.hiddenForPlayers === RelativePlayer.Opponent)) {
            const state = {
                controller: this.controller.getShortSummary(),
                owner: this.owner.getShortSummary(),
                // menu: isActivePlayer ? this.getMenu() : undefined,
                facedown: true,
                zone: this.zoneName,
                uuid: isActivePlayer ? this.uuid : undefined
            };
            return { ...state, ...selectionState };
        }


        const state = {
            id: this.cardData.id,
            setId: this.setId,
            controlled: this.owner !== this.controller,
            controller: this.controller.getShortSummary(),
            owner: this.owner.getShortSummary(),
            aspects: this.aspects,
            // facedown: this.isFacedown(),
            zone: this.zoneName,
            // menu: this.getMenu(),
            name: this.cardData.title,
            cost: this.cardData.cost,
            power: this.cardData.power,
            hp: this.cardData.hp,
            implemented: !this.overrideNotImplemented && (!this.hasNonKeywordAbilityText || this.hasImplementationFile),  // we consider a card "implemented" if it doesn't require any implementation
            // popupMenuText: this.popupMenuText,
            // showPopup: this.showPopup,
            // tokens: this.tokens,
            type: this.type,
            uuid: this.uuid,
            ...selectionState
        };

        return state;
    }

    public override getShortSummaryForControls(activePlayer: Player): any {
        if (!this.isHiddenForPlayer(activePlayer)) {
            return { hidden: true };
        }
        return super.getShortSummaryForControls(activePlayer);
    }

    private isHiddenForPlayer(player: Player) {
        switch (player) {
            case this.controller:
                return this.state.hiddenForController;
            case this.controller.opponent:
                return this.state.hiddenForOpponent;
            default:
                Contract.fail(`Unknown player: ${player}`);
                return false;
        }
    }

    public override toString() {
        return this.internalName;
    }
}