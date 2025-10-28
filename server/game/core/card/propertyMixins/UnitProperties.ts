import { InitiateAttackAction } from '../../../actions/InitiateAttackAction';
import type { Arena, MoveZoneDestination } from '../../Constants';
import { AbilityRestriction, AbilityType, CardType, EffectName, EventName, KeywordName, PlayType, StandardTriggeredAbilityType, StatType, Trait, WildcardRelativePlayer, ZoneName } from '../../Constants';
import StatsModifierWrapper from '../../ongoingEffect/effectImpl/StatsModifierWrapper';
import * as Contract from '../../utils/Contract';
import type { IInPlayCard, IInPlayCardState, InPlayCardConstructor } from '../baseClasses/InPlayCard';
import { InPlayCard } from '../baseClasses/InPlayCard';
import type { ICardWithDamageProperty } from './Damage';
import { WithDamage } from './Damage';
import type { ICardWithPrintedPowerProperty } from './PrintedPower';
import { WithPrintedPower } from './PrintedPower';
import * as EnumHelpers from '../../utils/EnumHelpers';
import type { Card } from '../Card';
import { InitializeCardStateOption } from '../Card';
import type { IAbilityPropsWithType, IConstantAbilityProps, IGainCondition, IKeywordPropertiesWithGainCondition, ITriggeredAbilityBaseProps, ITriggeredAbilityProps, ITriggeredAbilityPropsWithGainCondition, WhenTypeOrStandard } from '../../../Interfaces';
import type { BountyKeywordInstance } from '../../ability/KeywordInstance';
import { KeywordWithAbilityDefinition } from '../../ability/KeywordInstance';
import TriggeredAbility from '../../ability/TriggeredAbility';
import { RestoreAbility } from '../../../abilities/keyword/RestoreAbility';
import { ShieldedAbility } from '../../../abilities/keyword/ShieldedAbility';
import { SaboteurDefeatShieldsAbility } from '../../../abilities/keyword/SaboteurDefeatShieldsAbility';
import { AmbushAbility } from '../../../abilities/keyword/AmbushAbility';
import type Game from '../../Game';
import type { GameEvent } from '../../event/GameEvent';
import type { IDamageSource } from '../../../IDamageOrDefeatSource';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';
import { FrameworkDefeatCardSystem } from '../../../gameSystems/FrameworkDefeatCardSystem';
import type { ICaptorCard, ICardWithCaptureZone } from '../../zone/CaptureZone';
import { CaptureZone } from '../../zone/CaptureZone';
import OngoingEffectLibrary from '../../../ongoingEffects/OngoingEffectLibrary';
import type { Player } from '../../Player';
import { BountyAbility } from '../../../abilities/keyword/BountyAbility';
import type { IUpgradeCard } from '../CardInterfaces';
import type { ActionAbility } from '../../ability/ActionAbility';
import type { ILeaderCard } from './LeaderProperties';
import type { ILeaderUnitCard } from '../LeaderUnitCard';
import type { PilotLimitModifier } from '../../ongoingEffect/effectImpl/PilotLimitModifier';
import type { AbilityContext } from '../../ability/AbilityContext';
import type { PlayUpgradeAction } from '../../../actions/PlayUpgradeAction';
import type { GameObjectRef } from '../../GameObjectBase';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import type { LeadersDeployedThisPhaseWatcher } from '../../../stateWatchers/LeadersDeployedThisPhaseWatcher';
import type { ConstantAbility } from '../../ability/ConstantAbility';
import type { OngoingCardEffect } from '../../ongoingEffect/OngoingCardEffect';
import { getPrintedAttributesOverride } from '../../ongoingEffect/effectImpl/PrintedAttributesOverride';
import type { IInPlayCardAbilityRegistrar } from '../AbilityRegistrationInterfaces';
import type { ITriggeredAbilityRegistrar } from './TriggeredAbilityRegistration';
import type Clone from '../../../cards/03_TWI/units/Clone';

export const UnitPropertiesCard = WithUnitProperties(InPlayCard);
export interface IUnitPropertiesCardState extends IInPlayCardState {
    defaultArenaInternal: Arena;
    captureZone: GameObjectRef<CaptureZone> | null;
    lastPlayerToModifyHp?: GameObjectRef<Player>;
    upgrades: GameObjectRef<IUpgradeCard>[] | null;
    expiredLastingEffectChangedRemainingHp: boolean;

    whenCapturedKeywordAbilities?: GameObjectRef<TriggeredAbility>[];
    whenDefeatedKeywordAbilities?: GameObjectRef<TriggeredAbility>[];
    whenPlayedKeywordAbilities?: GameObjectRef<TriggeredAbility>[];
    whileInPlayKeywordAbilities?: GameObjectRef<ConstantAbility>[];
    attackKeywordAbilities?: GameObjectRef<(TriggeredAbility | ConstantAbility)>[];
    // protected
    pilotingActionAbilities: GameObjectRef<ActionAbility>[];
    // protected
    pilotingTriggeredAbilities: GameObjectRef<TriggeredAbility>[];
    // protected
    pilotingConstantAbilities: GameObjectRef<ConstantAbility>[];
}

type IAbilityPropsWithGainCondition<TSource extends IUpgradeCard, TTarget extends Card> = IAbilityPropsWithType<TTarget> & IGainCondition<TSource>;

export interface IUnitAbilityRegistrar<T extends IUnitCard> extends IInPlayCardAbilityRegistrar<T> {
    addOnAttackAbility(properties: Omit<ITriggeredAbilityProps<T>, 'when' | 'aggregateWhen'>): void;
    addOnAttackCompletedAbility(properties: Omit<ITriggeredAbilityProps<T>, 'when' | 'aggregateWhen'>): void;
    addBountyAbility(properties: Omit<ITriggeredAbilityBaseProps<T>, 'canBeTriggeredBy'>): void;
    addCoordinateAbility(properties: IAbilityPropsWithType<T>): void;
    addPilotingAbility(properties: IAbilityPropsWithType<T>): void;
    addPilotingConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<T>, 'title' | 'condition' | 'ongoingEffect'>): void;
    addPilotingGainKeywordTargetingAttached(properties: IKeywordPropertiesWithGainCondition<T>): void;
    addPilotingGainAbilityTargetingAttached(properties: IAbilityPropsWithGainCondition<T, IUnitCard>): void;
    addPilotingGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityPropsWithGainCondition<T, IUnitCard>): void;
}

export interface IUnitCard extends IInPlayCard, ICardWithDamageProperty, ICardWithPrintedPowerProperty, ICardWithCaptureZone {
    get defaultArena(): Arena;
    get lastPlayerToModifyHp(): Player;
    get isClonedUnit(): boolean;
    readonly upgrades: IUpgradeCard[];
    isClone(): this is Clone;
    getCaptor(): ICaptorCard | null;
    isAttacking(): boolean;
    isCaptured(): boolean;
    isUpgraded(): boolean;
    hasExperience(): boolean;
    hasShield(): boolean;
    effectsPreventAttack(target: Card);
    moveToCaptureZone(targetZone: CaptureZone);
    checkRegisterWhenPlayedKeywordAbilities(event: GameEvent);
    checkRegisterOnAttackKeywordAbilities(event: GameEvent);
    checkRegisterWhenDefeatedKeywordAbilities(event: GameEvent);
    checkRegisterWhenCapturedKeywordAbilities(event: GameEvent);
    unregisterWhenPlayedKeywords();
    unregisterAttackKeywords();
    unregisterWhenDefeatedKeywords();
    unregisterWhenCapturedKeywords();
    checkDefeatedByOngoingEffect();
    refreshWhileInPlayKeywordAbilityEffects();
    unattachUpgrade(upgrade, event);
    canAttachPilot(pilot: IUnitCard): boolean;
    attachUpgrade(upgrade);
    getNumericKeywordTotal(keywordName: KeywordName.Exploit | KeywordName.Restore | KeywordName.Raid): number | null;
    getMaxUnitAttackLimit(): number;
}

/**
 * Mixin function that adds the standard properties for a unit (leader or non-leader) to a base class.
 * Specifically it gains:
 * - hp, damage, and power (from the corresponding mixins {@link WithPrintedHp}, {@link WithDamage}, and {@link WithPrintedPower})
 * - the ability for hp and power to be modified by effects
 * - the {@link InitiateAttackAction} ability so that the card can attack
 * - the ability to have attached upgrades
 */
export function WithUnitProperties<TBaseClass extends InPlayCardConstructor<TState>, TState extends IInPlayCardState>(BaseClass: TBaseClass) {
    // create a "base" class that has the damage, hp, and power properties from other mixins
    const StatsAndDamageClass = WithDamage(WithPrintedPower(BaseClass));

    return class AsUnit extends (StatsAndDamageClass as typeof StatsAndDamageClass & InPlayCardConstructor<TState & IUnitPropertiesCardState>) implements IUnitCard {
        public static registerRulesListeners(game: Game) {
            // register listeners for when-played keyword abilities (see comment in EventWindow.ts for explanation of 'postResolve')
            game.on(EventName.OnUnitEntersPlay + ':postResolve', (event) => {
                const card = event.card as Card;
                if (card.isUnit()) {
                    card.checkRegisterWhenPlayedKeywordAbilities(event);
                }
            });

            // register listeners for on-attack keyword abilities
            game.on(EventName.OnAttackDeclared, (event) => {
                const card = event.attack.attacker as Card;
                if (card.isUnit()) {
                    card.checkRegisterOnAttackKeywordAbilities(event);
                }
            });

            // register listeners for on-defeat keyword abilities
            game.on(EventName.OnCardDefeated + ':preResolve', (event) => {
                const card = event.card as Card;
                if (card.zoneName !== ZoneName.Resource && card.isUnit()) {
                    card.checkRegisterWhenDefeatedKeywordAbilities(event);
                }
            });

            // register listeners for on-capture keyword abilities
            game.on(EventName.OnCardCaptured, (event) => {
                const card = event.card as Card;
                Contract.assertTrue(card.isNonLeaderUnit());
                card.checkRegisterWhenCapturedKeywordAbilities(event);
            });
        }

        // ************************************* FIELDS AND PROPERTIES *************************************
        private readonly _defaultArena: Arena;
        private readonly defaultAttackAction: InitiateAttackAction;

        public get lastPlayerToModifyHp(): Player {
            Contract.assertTrue(this.isInPlay());
            return this.game.gameObjectManager.get(this.state.lastPlayerToModifyHp);
        }

        private set lastPlayerToModifyHp(value: Player) {
            this.state.lastPlayerToModifyHp = value?.getRef();
        }

        private get attackKeywordAbilities(): (readonly (TriggeredAbility | ConstantAbility)[] | null) {
            return this.state.attackKeywordAbilities?.map((x) => this.game.getFromRef(x));
        }

        private get whenCapturedKeywordAbilities(): (readonly TriggeredAbility[]) | null {
            return this.state.whenCapturedKeywordAbilities?.map((x) => this.game.getFromRef(x));
        }

        private get whenDefeatedKeywordAbilities(): (readonly TriggeredAbility[]) | null {
            return this.state.whenDefeatedKeywordAbilities?.map((x) => this.game.getFromRef(x));
        }

        private get whenPlayedKeywordAbilities(): (readonly TriggeredAbility[]) | null {
            return this.state.whenPlayedKeywordAbilities?.map((x) => this.game.getFromRef(x));
        }

        private get whileInPlayKeywordAbilities(): (readonly ConstantAbility[]) | null {
            return this.state.whileInPlayKeywordAbilities?.map((x) => this.game.getFromRef(x));
        }

        protected get pilotingActionAbilities(): readonly ActionAbility[] {
            return this.state.pilotingActionAbilities.map((x) => this.game.getFromRef(x));
        }

        protected get pilotingTriggeredAbilities(): readonly TriggeredAbility[] {
            return this.state.pilotingTriggeredAbilities.map((x) => this.game.getFromRef(x));
        }

        private get pilotingConstantAbilities(): readonly ConstantAbility[] {
            return this.state.pilotingConstantAbilities.map((x) => this.game.getFromRef(x));
        }

        private _cardsPlayedThisWatcher: CardsPlayedThisPhaseWatcher;
        private _leadersDeployedThisPhaseWatcher: LeadersDeployedThisPhaseWatcher;

        public get capturedUnits() {
            this.assertPropertyEnabledForZone(this.state.captureZone, 'capturedUnits');
            return this.captureZone.cards;
        }

        public get captureZone() {
            this.assertPropertyEnabledForZone(this.state.captureZone, 'captureZone');
            return this.game.gameObjectManager.get(this.state.captureZone);
        }

        public get upgrades(): IUpgradeCard[] {
            this.assertPropertyEnabledForZone(this.state.upgrades, 'upgrades');
            return this.state.upgrades.map((x) => this.game.gameObjectManager.get(x));
        }

        public get defaultArena(): Arena {
            if (this.hasOngoingEffect(EffectName.PrintedAttributesOverride)) {
                const override = getPrintedAttributesOverride('defaultArena', this.getOngoingEffectValues(EffectName.PrintedAttributesOverride));
                if (override != null) {
                    return override;
                }
            }
            return this._defaultArena;
        }

        public get isClonedUnit(): boolean {
            return this.hasOngoingEffect(EffectName.CloneUnit);
        }

        public isClone(): this is Clone {
            return false;
        }

        public getCaptor(): ICaptorCard | null {
            if (this.zone.name !== ZoneName.Capture) {
                return null;
            }

            return this.zone.captor;
        }

        public isAttacking(): boolean {
            return this === this.activeAttack?.attacker;
        }

        public isCaptured(): boolean {
            return this.zoneName === ZoneName.Capture;
        }

        public isUpgraded(): boolean {
            return this.state.upgrades.length > 0;
        }

        public hasExperience(): boolean {
            return this.upgrades.some((card) => card.isExperience());
        }

        public hasShield(): boolean {
            return this.upgrades.some((card) => card.isShield());
        }

        public hasSentinel(): boolean {
            return this.hasSomeKeyword(KeywordName.Sentinel);
        }

        public override isLeader(): this is ILeaderCard {
            return this.isLeaderAttachedToThis();
        }

        public override isLeaderUnit(): this is ILeaderUnitCard {
            return this.isLeaderAttachedToThis();
        }

        protected isLeaderAttachedToThis(): boolean {
            return this.hasOngoingEffect(EffectName.IsLeader);
        }

        public override isUpgrade(): this is IUpgradeCard {
            return this.state.parentCard != null;
        }

        // ****************************************** CONSTRUCTOR ******************************************
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertTrue(EnumHelpers.isUnit(this.printedType) || this.printedType === CardType.Leader);

            Contract.assertNotNullLike(cardData.arena);
            switch (cardData.arena) {
                case 'space':
                    this._defaultArena = ZoneName.SpaceArena;
                    break;
                case 'ground':
                    this._defaultArena = ZoneName.GroundArena;
                    break;
                default:
                    Contract.fail(`Unknown arena type in card data: ${cardData.arena}`);
            }

            if (this.hasSomeKeyword(KeywordName.Piloting)) {
                Contract.assertNotNullLike(cardData.upgradeHp, `Card ${this.internalName} is missing upgradeHp`);
                Contract.assertNotNullLike(cardData.upgradePower, `Card ${this.internalName} is missing upgradePower`);

                this.validateCardAbilities(this.pilotingTriggeredAbilities as TriggeredAbility[], cardData.pilotText);
            }

            this._cardsPlayedThisWatcher = this.game.abilityHelper.stateWatchers.cardsPlayedThisPhase();
            this._leadersDeployedThisPhaseWatcher = this.game.abilityHelper.stateWatchers.leadersDeployedThisPhase();

            this.defaultAttackAction = new InitiateAttackAction(this.game, this);
        }

        protected override setupDefaultState() {
            super.setupDefaultState();
            this.state.upgrades = null;
            this.state.whenCapturedKeywordAbilities = null;
            this.state.whenDefeatedKeywordAbilities = null;
            this.state.whenPlayedKeywordAbilities = null;
            this.state.pilotingActionAbilities = [];
            this.state.pilotingConstantAbilities = [];
            this.state.pilotingTriggeredAbilities = [];
        }

        protected override initializeStateForAbilitySetup() {
            super.initializeStateForAbilitySetup();
        }

        // ****************************************** PROPERTY HELPERS ******************************************
        public override getHp(): number {
            return this.getModifiedStatValue(StatType.Hp);
        }

        public override getPower(): number {
            return this.getModifiedStatValue(StatType.Power);
        }

        public override isUnit(): this is IUnitCard {
            return this.state.parentCard == null;
        }

        protected override getType(): CardType {
            if (this.isLeaderAttachedToThis()) {
                return CardType.LeaderUnit;
            }
            return super.getType();
        }

        protected setCaptureZoneEnabled(enabledStatus: boolean) {
            const zone = enabledStatus ? new CaptureZone(this.game, this.owner, this) : null;
            this.state.captureZone = zone?.getRef();
        }

        protected override setDamageEnabled(enabledStatus: boolean): void {
            super.setDamageEnabled(enabledStatus);
        }

        protected setUpgradesEnabled(enabledStatus: boolean) {
            this.state.upgrades = enabledStatus ? [] : null;
        }

        // ***************************************** MISC HELPERS *****************************************
        /**
         * Check if there are any effect restrictions preventing this unit from attacking the passed target.
         * Returns true if so.
         */
        public effectsPreventAttack(target: Card) {
            if (this.hasRestriction(AbilityRestriction.Attack)) {
                return true;
            }
            if (this.hasOngoingEffect(EffectName.CannotAttackBase) && target.isBase()) {
                return true;
            }

            if (this.hasOngoingEffect(EffectName.CannotAttack)) {
                return true;
            }

            return false;
        }

        public moveToCaptureZone(targetZone: CaptureZone) {
            Contract.assertNotNullLike(this.zone, `Attempting to capture card ${this.internalName} before initializing zone`);

            const prevZone = this.zoneName;
            this.removeFromCurrentZone();

            Contract.assertTrue(this.isUnit());
            targetZone.addCard(this);
            this.zone = targetZone;

            this.postMoveSteps(prevZone);
        }

        public override moveTo(targetZoneName: MoveZoneDestination, initializeCardState: InitializeCardStateOption = InitializeCardStateOption.Initialize) {
            const preMoveZone = this.zoneName;

            super.moveTo(targetZoneName, initializeCardState);

            if (this.zoneName === preMoveZone && EnumHelpers.isArena(this.zoneName)) {
                this.updateStateOnDetach();
            }
        }

        protected updateStateOnDetach() {
            return;
        }

        // ***************************************** ABILITY HELPERS *****************************************
        protected override getAbilityRegistrar(): IUnitAbilityRegistrar<this> {
            const registrar = super.getAbilityRegistrar() as IInPlayCardAbilityRegistrar<this>;

            return {
                ...registrar,
                addOnAttackAbility: (properties) => this.addOnAttackAbility(properties, registrar),
                addOnAttackCompletedAbility: (properties) => this.addOnAttackCompletedAbility(properties, registrar),
                addBountyAbility: (properties) => this.addBountyAbility(properties),
                addCoordinateAbility: (properties) => this.addCoordinateAbility(properties),
                addPilotingAbility: (properties) => this.addPilotingAbility(properties),
                addPilotingConstantAbilityTargetingAttached: (properties) => this.addPilotingConstantAbilityTargetingAttached(properties),
                addPilotingGainKeywordTargetingAttached: (properties) => this.addPilotingGainKeywordTargetingAttached(properties),
                addPilotingGainAbilityTargetingAttached: (properties) => this.addPilotingGainAbilityTargetingAttached(properties),
                addPilotingGainTriggeredAbilityTargetingAttached: (properties) => this.addPilotingGainTriggeredAbilityTargetingAttached(properties),
            };
        }

        public override getActions() {
            if (EnumHelpers.isUnitUpgrade(this.getType())) {
                return this.pilotingActionAbilities as ActionAbility[];
            }

            const actions = super.getActions().concat(this.defaultAttackAction);

            // If this unit must attack and an attack action is available, return just that action.
            // This is used by cards such as Give In to Your Anger
            if (this.hasOngoingEffect(EffectName.MustAttack) && actions.some((action) => action.isAttackAction() && action.meetsRequirements() === '')) {
                return actions.filter((action) => action.isAttackAction());
            }

            return actions;
        }

        private addOnAttackAbility(properties: Omit<ITriggeredAbilityProps<this>, 'when' | 'aggregateWhen'>, registar: ITriggeredAbilityRegistrar<this>): void {
            const when: WhenTypeOrStandard = { [StandardTriggeredAbilityType.OnAttack]: true };
            registar.addTriggeredAbility({ ...properties, when });
        }

        private addOnAttackCompletedAbility(properties: Omit<ITriggeredAbilityProps<this>, 'when' | 'aggregateWhen'>, registar: ITriggeredAbilityRegistrar<this>): void {
            const when: WhenTypeOrStandard = { [EventName.OnAttackCompleted]: (event, context) => event.attack.attacker === context.source };
            registar.addTriggeredAbility({ ...properties, when });
        }

        private addBountyAbility(properties: Omit<ITriggeredAbilityBaseProps<this>, 'canBeTriggeredBy'>): void {
            const bountyKeywords = this.printedKeywords.filter((keyword) => keyword.name === KeywordName.Bounty);
            const bountyKeywordsWithoutImpl = bountyKeywords.filter((keyword) => !keyword.isFullyImplemented);

            if (bountyKeywordsWithoutImpl.length === 0) {
                const bountyKeywordsWithImpl = bountyKeywords.filter((keyword) => keyword.isFullyImplemented);

                if (bountyKeywordsWithImpl.length > 0) {
                    Contract.fail(`Attempting to add a bounty ability '${properties.title}' to ${this.internalName} but all instances of the Bounty keyword already have a definition`);
                }

                Contract.fail(`Attempting to add a bounty ability '${properties.title}' to ${this.internalName} but it has no printed instances of the Bounty keyword`);
            }

            const bountyAbilityToAssign = bountyKeywordsWithoutImpl[0];

            // TODO: see if there's a better way using discriminating unions to avoid needing a cast when getting keyword instances
            Contract.assertTrue(bountyAbilityToAssign.isBounty());
            bountyAbilityToAssign.setAbilityProps(properties);
        }

        protected createCoordinateAbilityProps(properties: IAbilityPropsWithType<this>): IAbilityPropsWithType<this> {
            return properties;
        }

        private addCoordinateAbility(properties: IAbilityPropsWithType<this>): void {
            const coordinateKeywords = this.printedKeywords.filter((keyword) => keyword.name === KeywordName.Coordinate);
            Contract.assertTrue(
                coordinateKeywords.length > 0,
                `Attempting to add a coordinate ability '${properties.title}' to ${this.internalName} but it has no printed instances of the Coordinate keyword`
            );

            const coordinateKeywordsWithoutImpl = coordinateKeywords.filter((keyword) => !keyword.isFullyImplemented);
            Contract.assertTrue(
                coordinateKeywordsWithoutImpl.length > 0,
                `Attempting to add a coordinate ability '${properties.title}' to ${this.internalName} but all instances of the Coordinate keyword already have a definition`
            );

            const coordinateAbilityToAssign = coordinateKeywordsWithoutImpl[0];

            // TODO: see if there's a better way using discriminating unions to avoid needing a cast when getting keyword instances
            Contract.assertTrue(coordinateAbilityToAssign instanceof KeywordWithAbilityDefinition);
            coordinateAbilityToAssign.setAbilityProps(this.createCoordinateAbilityProps(properties));
        }

        private addPilotingAbility(properties: IAbilityPropsWithType<this>): void {
            this.checkIsAttachable();

            switch (properties.type) {
                case AbilityType.Action:
                    this.state.pilotingActionAbilities.push(this.createActionAbility(properties).getRef());
                    break;
                case AbilityType.Constant:
                    this.state.pilotingConstantAbilities.push(this.createConstantAbility(properties).getRef());
                    break;
                case AbilityType.Triggered:
                    this.state.pilotingTriggeredAbilities.push(this.createTriggeredAbility(properties).getRef());
                    break;
                case AbilityType.ReplacementEffect:
                    this.state.pilotingTriggeredAbilities.push(this.createReplacementEffectAbility(properties).getRef());
                    break;
                default:
                    Contract.fail(`Unsupported ability type ${(properties as any).type}`);
            }
        }

        public override takeControl(newController: Player, moveTo: ZoneName.SpaceArena | ZoneName.GroundArena | ZoneName.Resource = null) {
            const changedController = super.takeControl(newController, moveTo);

            if (changedController && this.isInPlay() && this.canHaveActiveAttack() && this.activeAttack) {
                this.activeAttack.unitChangedController(this);
            }

            return changedController;
        }

        private addPilotingConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<this>, 'title' | 'condition' | 'ongoingEffect'>) {
            this.addPilotingAbility({
                type: AbilityType.Constant,
                title: properties.title,
                matchTarget: (card, context) => card === context.source.parentCard,
                targetController: WildcardRelativePlayer.Any,   // this means that the effect continues to work even if the other player gains control of the upgrade
                condition: this.addZoneCheckToGainCondition(properties.condition),
                ongoingEffect: properties.ongoingEffect
            });
        }

        private addPilotingGainKeywordTargetingAttached(properties: IKeywordPropertiesWithGainCondition<this>) {
            const { gainCondition, ...gainedKeywordProperties } = properties;

            this.addPilotingConstantAbilityTargetingAttached({
                title: 'Give keyword to the attached card',
                condition: this.addZoneCheckToGainCondition(gainCondition),
                ongoingEffect: OngoingEffectLibrary.gainKeyword(gainedKeywordProperties)
            });
        }

        private addPilotingGainAbilityTargetingAttached(properties: IAbilityPropsWithGainCondition<this, IUnitCard>) {
            const { gainCondition, ...gainedAbilityProperties } = properties;

            this.addPilotingConstantAbilityTargetingAttached({
                title: 'Give ability to the attached card',
                condition: this.addZoneCheckToGainCondition(gainCondition),
                ongoingEffect: OngoingEffectLibrary.gainAbility(gainedAbilityProperties)
            });
        }

        private addPilotingGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityPropsWithGainCondition<this, IUnitCard>) {
            this.addPilotingGainAbilityTargetingAttached({
                type: AbilityType.Triggered,
                title: 'Give triggered ability to the attached card',
                ...properties
            });
        }

        public override getTriggeredAbilities(): TriggeredAbility[] {
            if (this.isFullyBlanked()) {
                return [];
            }

            if (EnumHelpers.isUnitUpgrade(this.getType())) {
                return this.pilotingTriggeredAbilities as TriggeredAbility[];
            }

            let triggeredAbilities = EnumHelpers.isUnitUpgrade(this.getType()) ? this.pilotingTriggeredAbilities : super.getTriggeredAbilities();

            if (this.hasOngoingEffect(EffectName.BlankExceptFromSourceCard)) {
                // Only return triggered abilities gained from the source of the blanking effect
                return triggeredAbilities.filter((ability) => this.canGainAbilityFromSource(ability.gainAbilitySource)) as TriggeredAbility[];
            }

            // add any temporarily registered attack abilities from keywords
            if (this.state.attackKeywordAbilities != null) {
                triggeredAbilities = triggeredAbilities.concat(this.attackKeywordAbilities.filter((ability) => ability instanceof TriggeredAbility));
            }
            if (this.state.whenCapturedKeywordAbilities != null) {
                triggeredAbilities = triggeredAbilities.concat(this.whenCapturedKeywordAbilities);
            }
            if (this.state.whenDefeatedKeywordAbilities != null) {
                triggeredAbilities = triggeredAbilities.concat(this.whenDefeatedKeywordAbilities);
            }
            if (this.state.whenPlayedKeywordAbilities != null) {
                triggeredAbilities = triggeredAbilities.concat(this.whenPlayedKeywordAbilities);
            }

            return triggeredAbilities as TriggeredAbility[];
        }

        public override getConstantAbilities(): ConstantAbility[] {
            if (this.isFullyBlanked()) {
                return [];
            }

            if (EnumHelpers.isUnitUpgrade(this.getType())) {
                return this.pilotingConstantAbilities as ConstantAbility[];
            }

            let constantAbilities = EnumHelpers.isUnitUpgrade(this.getType()) ? this.pilotingConstantAbilities : super.getConstantAbilities();

            // add any temporarily registered attack abilities from keywords
            if (this.state.attackKeywordAbilities != null) {
                constantAbilities = constantAbilities.concat(
                    this.attackKeywordAbilities.filter((ability) => !(ability instanceof TriggeredAbility))
                        .map((ability) => ability as ConstantAbility)
                );
            }

            // add any registered abilities from keywords effective while in play
            if (this.state.whileInPlayKeywordAbilities != null) {
                constantAbilities = constantAbilities.concat(this.whileInPlayKeywordAbilities);
            }

            return constantAbilities as ConstantAbility[];
        }

        protected override updateTriggeredAbilitiesForZone(from: ZoneName, to: ZoneName) {
            super.updateTriggeredAbilityEventsInternal(this.pilotingTriggeredAbilities.concat(this.triggeredAbilities), from, to);
        }

        protected override updateConstantAbilityEffects(from: ZoneName, to: ZoneName): void {
            super.updateConstantAbilityEffectsInternal(this.pilotingConstantAbilities.concat(this.constantAbilities as ConstantAbility[]), from, to, true);
        }

        /** Register / un-register the effects for any abilities from keywords */
        protected override updateKeywordAbilityEffects(from: ZoneName, to: ZoneName) {
            // Unregister all effects when moving a card from an arena to a non-arena zone
            // or from a base to an arena
            if ((EnumHelpers.isArena(from) && !EnumHelpers.isArena(to)) || (from === ZoneName.Base && EnumHelpers.isArena(to))) {
                this.unregisterWhileInPlayKeywordAbilityEffects();
            }

            // Register all effects when moving a card to a base or from a non-arena zone to an arena,
            // this is to support leaders with the Coordinate keyword
            if ((!EnumHelpers.isArena(from) && EnumHelpers.isArena(to)) || to === ZoneName.Base) {
                this.registerWhileInPlayKeywordAbilityEffects();
            }
        }

        public refreshWhileInPlayKeywordAbilityEffects() {
            this.unregisterWhileInPlayKeywordAbilityEffects();
            this.registerWhileInPlayKeywordAbilityEffects();
        }

        private unregisterWhileInPlayKeywordAbilityEffects() {
            Contract.assertTrue(Array.isArray(this.state.whileInPlayKeywordAbilities), 'Keyword ability while in play registration was skipped');

            for (const keywordAbility of this.whileInPlayKeywordAbilities) {
                this.removeEffectFromEngine(keywordAbility.registeredEffects);
                keywordAbility.registeredEffects = [];
            }

            this.state.whileInPlayKeywordAbilities = null;
        }

        private registerWhileInPlayKeywordAbilityEffects() {
            Contract.assertIsNullLike(
                this.state.whileInPlayKeywordAbilities,
                () => `Failed to unregister when played abilities from previous play: ${this.whileInPlayKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this.state.whileInPlayKeywordAbilities = [];

            for (const keywordInstance of this.getCoordinateAbilities()) {
                const gainedAbilityProps = keywordInstance.abilityProps;

                const coordinateKeywordAbilityProps: IConstantAbilityProps = {
                    title: `Coordinate: ${gainedAbilityProps.title}`,
                    condition: (context) => context.player.getArenaUnits().length >= 3 && !keywordInstance.isBlank,
                    ongoingEffect: OngoingEffectLibrary.gainAbility(gainedAbilityProps)
                };

                const coordinateKeywordAbility = this.createConstantAbility(coordinateKeywordAbilityProps);
                coordinateKeywordAbility.registeredEffects = this.addEffectToEngine(coordinateKeywordAbility);

                this.state.whileInPlayKeywordAbilities.push(coordinateKeywordAbility.getRef());
            }

            if (this.hasSomeKeyword(KeywordName.Hidden)) {
                const hiddenKeywordAbilityProps: IConstantAbilityProps<this> = {
                    title: 'Hidden',
                    condition: (context) => context.source.isInPlay() && this.wasPlayedThisPhase(context.source),
                    ongoingEffect: this.game.abilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
                };

                const hiddenKeywordAbility = this.createConstantAbility(hiddenKeywordAbilityProps);
                hiddenKeywordAbility.registeredEffects = this.addEffectToEngine(hiddenKeywordAbility);

                this.state.whileInPlayKeywordAbilities.push(hiddenKeywordAbility.getRef());
            }
        }

        private wasPlayedThisPhase(card: this = this): boolean {
            try {
                return this._cardsPlayedThisWatcher.someCardPlayed((entry) => entry.card === card && entry.inPlayId === card.inPlayId) ||
                  this._leadersDeployedThisPhaseWatcher.someLeaderDeployed((entry) => entry.card === card);
            } catch (err) {
                return false;
            }
        }

        // *************************************** KEYWORD HELPERS ***************************************
        /**
         * Checks if the unit currently has any keywords with a "when played" effect and registers them if so.
         * Also adds a listener to remove the registered abilities after the effect resolves.
         */
        public checkRegisterWhenPlayedKeywordAbilities(event: GameEvent) {
            const hasAmbush = this.hasSomeKeyword(KeywordName.Ambush);
            const hasShielded = this.hasSomeKeyword(KeywordName.Shielded);

            if (!hasAmbush && !hasShielded) {
                return;
            }

            Contract.assertIsNullLike(
                this.whenPlayedKeywordAbilities,
                `Failed to unregister when played abilities from previous play: ${this.whenPlayedKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this.state.whenPlayedKeywordAbilities = [];

            if (hasAmbush) {
                const ambushProps = Object.assign(this.buildGeneralAbilityProps('keyword_ambush'), AmbushAbility.buildAmbushAbilityProperties());
                const ambushAbility = this.createTriggeredAbility(ambushProps);
                ambushAbility.registerEvents();
                this.state.whenPlayedKeywordAbilities.push(ambushAbility.getRef());
            }

            if (hasShielded) {
                const shieldedProps = Object.assign(this.buildGeneralAbilityProps('keyword_shielded'), ShieldedAbility.buildShieldedAbilityProperties());
                const shieldedAbility = this.createTriggeredAbility(shieldedProps);
                shieldedAbility.registerEvents();
                this.state.whenPlayedKeywordAbilities.push(shieldedAbility.getRef());
            }

            event.addCleanupHandler(() => this.unregisterWhenPlayedKeywords());
        }

        /**
         * Registers any keywords which need to be explicitly registered for the attack process.
         * These should be unregistered after the end of the attack.
         *
         * Note: Check rule 7.5 to see if a keyword should be here. Only keywords that are
         *      "On Attack" keywords should go here. As of Set 2 (SHD) this is only Restore
         *      and the defeat all shields portion of Saboteur.
         */
        public checkRegisterOnAttackKeywordAbilities(event: GameEvent) {
            const hasRestore = this.hasSomeKeyword(KeywordName.Restore);
            const hasSaboteur = this.hasSomeKeyword(KeywordName.Saboteur);

            if (!hasRestore && !hasSaboteur) {
                return;
            }

            Contract.assertIsNullLike(
                this.state.attackKeywordAbilities,
                () => `Failed to unregister on attack abilities from previous attack: ${this.attackKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this.state.attackKeywordAbilities = [];

            if (hasRestore) {
                const restoreAmount = this.getNumericKeywordTotal(KeywordName.Restore);
                const restoreProps = Object.assign(this.buildGeneralAbilityProps('keyword_restore'), RestoreAbility.buildRestoreAbilityProperties(restoreAmount));
                const restoreAbility = this.createTriggeredAbility(restoreProps);
                restoreAbility.registerEvents();
                this.state.attackKeywordAbilities.push(restoreAbility.getRef());
            }

            if (hasSaboteur) {
                const saboteurProps = Object.assign(this.buildGeneralAbilityProps('keyword_saboteur'), SaboteurDefeatShieldsAbility.buildSaboteurAbilityProperties());
                const saboteurAbility = this.createTriggeredAbility(saboteurProps);
                saboteurAbility.registerEvents();
                this.state.attackKeywordAbilities.push(saboteurAbility.getRef());
            }

            event.addCleanupHandler(() => this.unregisterAttackKeywords());
        }

        /**
         * Checks if the unit currently has any keywords with a "when defeated" effect and registers them if so.
         * Also adds a listener to remove the registered abilities after the effect resolves.
         */
        public checkRegisterWhenDefeatedKeywordAbilities(event: GameEvent) {
            const bountyKeywords = this.getBountyKeywords();
            if (bountyKeywords.length === 0) {
                return;
            }

            Contract.assertIsNullLike(
                this.state.whenDefeatedKeywordAbilities,
                `Failed to unregister when defeated abilities from previous defeat: ${this.whenDefeatedKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this.state.whenDefeatedKeywordAbilities = this.registerBountyKeywords(bountyKeywords).map((x) => x.getRef());

            event.addCleanupHandler(() => this.unregisterWhenDefeatedKeywords());
        }

        /**
         * Checks if the unit currently has any keywords with a "when captured" effect and registers them if so.
         * Also adds a listener to remove the registered abilities after the effect resolves.
         */
        public checkRegisterWhenCapturedKeywordAbilities(event: GameEvent) {
            const bountyKeywords = this.getBountyKeywords();
            if (bountyKeywords.length === 0) {
                return;
            }

            Contract.assertIsNullLike(
                this.state.whenCapturedKeywordAbilities,
                () => `Failed to unregister when captured abilities from previous capture: ${this.whenCapturedKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this.state.whenCapturedKeywordAbilities = this.registerBountyKeywords(bountyKeywords).map((x) => x.getRef());

            event.addCleanupHandler(() => this.unregisterWhenCapturedKeywords());
        }

        private registerBountyKeywords(bountyKeywords: BountyKeywordInstance[]): TriggeredAbility[] {
            const registeredAbilities: TriggeredAbility[] = [];

            for (const bountyKeyword of bountyKeywords) {
                const abilityProps = bountyKeyword.abilityProps;

                const bountyAbility = new BountyAbility(this.game, this, { ...this.buildGeneralAbilityProps('triggered'), ...abilityProps });

                bountyAbility.registerEvents();
                registeredAbilities.push(bountyAbility);
            }

            return registeredAbilities;
        }

        private getBountyKeywords() {
            return this.getKeywords().filter((keyword) => keyword.name === KeywordName.Bounty)
                .map((keyword) => keyword as BountyKeywordInstance)
                .filter((keyword) => keyword.isFullyImplemented);
        }

        private getCoordinateAbilities() {
            return this.getKeywords().filter((keyword) => keyword.name === KeywordName.Coordinate)
                .map((keyword) => keyword as KeywordWithAbilityDefinition)
                .filter((keyword) => keyword.isFullyImplemented);
        }

        public unregisterWhenPlayedKeywords() {
            Contract.assertTrue(Array.isArray(this.state.whenPlayedKeywordAbilities), 'Keyword ability when played registration was skipped');

            for (const ability of this.whenPlayedKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                }
            }

            this.state.whenPlayedKeywordAbilities = null;
        }

        /**
         * Unregisters any keywords which need to be explicitly registered for the attack process.
         * These should be unregistered after the end of the attack.
         */
        public unregisterAttackKeywords() {
            Contract.assertTrue(Array.isArray(this.state.attackKeywordAbilities), 'Keyword ability attack registration was skipped');

            for (const ability of this.attackKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                } else {
                    this.removeEffectFromEngine(ability.registeredEffects[0]);
                }
            }

            this.state.attackKeywordAbilities = null;
        }

        public unregisterWhenDefeatedKeywords() {
            Contract.assertTrue(Array.isArray(this.state.whenDefeatedKeywordAbilities), 'Keyword ability when defeated registration was skipped');

            for (const ability of this.whenDefeatedKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                }
            }

            this.state.whenDefeatedKeywordAbilities = null;
        }

        public unregisterWhenCapturedKeywords() {
            Contract.assertTrue(Array.isArray(this.state.whenCapturedKeywordAbilities), 'Keyword ability when captured registration was skipped');

            for (const ability of this.whenCapturedKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                }
            }

            this.state.whenCapturedKeywordAbilities = null;
        }

        // ***************************************** STAT HELPERS *****************************************
        public override addDamage(amount: number, source: IDamageSource): number {
            const damageAdded = super.addDamage(amount, source);

            if (damageAdded > 0) {
                this.state.expiredLastingEffectChangedRemainingHp = false;
            }

            this.checkDefeated(source);

            return damageAdded;
        }

        // TODO: FFG has yet to release detailed rules about how effects are used to determine which player defeated a unit,
        // specifically for complex cases like "what if Dodonna effect is keeping a Rebel unit alive and Dodonna is defeated."
        // Need to come through and implement that in the methods below once rules 3.0 comes out.

        /** Checks if the unit has been defeated due to an ongoing effect such as hp reduction */
        public checkDefeatedByOngoingEffect() {
            this.checkDefeated(DefeatSourceType.FrameworkEffect);
        }

        protected checkDefeated(source: IDamageSource | DefeatSourceType.FrameworkEffect) {
            // if this card can't be defeated by damage (e.g. Chirrut), skip the check
            if (this.hasOngoingEffect(EffectName.CannotBeDefeatedByDamage)) {
                return;
            }

            if (this.damage >= this.getHp() && !this.state.pendingDefeat) {
                const defeatEvent = new FrameworkDefeatCardSystem({
                    target: this,
                    defeatSource: source,
                    defeatedByExpiringLastingEffect: this.state.expiredLastingEffectChangedRemainingHp,
                }).generateEvent(
                    this.game.getFrameworkContext(typeof source === 'object' ? source.player : null)
                );

                // add defeat event to window
                this.game.addSubwindowEvents(defeatEvent);

                this.game.queueSimpleStep(() => {
                    const responsiblePlayer = (defeatEvent as any).defeatSource?.player;
                    if (responsiblePlayer) {
                        this.game.addMessage('{0}\'s {1} is defeated by {2} due to having no remaining HP', this.controller, this, responsiblePlayer);
                    } else {
                        this.game.addMessage('{0}\'s {1} is defeated due to having no remaining HP', this.controller, this);
                    }
                }, `Log defeat message for ${this.internalName}`);

                // mark that this unit has a defeat pending so that other effects targeting it will not resolve
                this.state.pendingDefeat = true;
            }

            // Reset the flag becuase at this point we already know if the unit was defeated or not
            this.state.expiredLastingEffectChangedRemainingHp = false;
        }

        private getModifiedStatValue(statType: StatType, floor = true, excludeModifiers: string[] = []) {
            const wrappedModifiers = this.getStatModifiers(excludeModifiers);

            const baseStatValue = StatsModifierWrapper.fromPrintedValues(this);

            const stat = wrappedModifiers.reduce((total, wrappedModifier) => total + wrappedModifier.modifier[statType], baseStatValue.modifier[statType]);

            return floor ? Math.max(0, stat) : stat;
        }

        // TODO: add a summary method that logs these modifiers (i.e., the names, amounts, etc.)
        private getStatModifiers(exclusions: (string[] | ((effect: OngoingCardEffect) => boolean)) = []): StatsModifierWrapper[] {
            let rawEffects: OngoingCardEffect[];
            if (typeof exclusions === 'function') {
                rawEffects = this.getOngoingEffects().filter((effect) => !exclusions(effect));
            } else {
                rawEffects = this.getOngoingEffects().filter((effect) => !exclusions.includes(effect.type));
            }

            const modifierEffects: OngoingCardEffect[] = rawEffects.filter((effect) => effect.type === EffectName.ModifyStats);
            const wrappedStatsModifiers = modifierEffects.map((modifierEffect) => StatsModifierWrapper.fromEffect(modifierEffect, this));

            if (!this.isAttached()) {
                // add stat bonuses from attached upgrades
                this.upgrades.forEach((upgrade) => wrappedStatsModifiers.push(StatsModifierWrapper.fromPrintedValues(upgrade)));

                if (this.hasSomeKeyword(KeywordName.Grit)) {
                    const gritModifier = { power: this.damage, hp: 0 };
                    wrappedStatsModifiers.push(new StatsModifierWrapper(gritModifier, 'Grit', false, this.type));
                }

                const raidAmount = this.getNumericKeywordTotal(KeywordName.Raid);
                if (this.isAttacking() && raidAmount > 0) {
                    const raidModifier = { power: raidAmount, hp: 0 };
                    wrappedStatsModifiers.push(new StatsModifierWrapper(raidModifier, 'Raid', false, this.type));
                }
            }

            return wrappedStatsModifiers;
        }


        public override checkIsAttachable(): void {
            throw new Error('Should not call this - call overriding methods');
        }

        /**
         *  This should only be called if a unit is a Pilot or has some other ability that lets it attach as an upgrade
         * @param {Card} targetCard The card that this would be attached to
         * @param {AbilityContext} context The ability context
         * @param {Player} controller The controller of this card
         * @returns True if this is allowed to attach to the targetCard; false otherwise
         */
        public override canAttach(targetCard: Card, context: AbilityContext, controller: Player = this.controller): boolean {
            Contract.assertTrue(this.canBeUpgrade);
            if (targetCard.isUnit()) {
                if (context.playType === PlayType.Piloting && this.hasSomeKeyword(KeywordName.Piloting)) {
                    // This is needed for abilities that let you play Pilots from the opponent's discard
                    const canPlayFromAnyZone = (context.ability as PlayUpgradeAction).canPlayFromAnyZone;
                    return targetCard.canAttachPilot(this) && (targetCard.controller === controller || canPlayFromAnyZone);
                } else if (this.hasSomeTrait(Trait.Pilot)) {
                    return targetCard.canAttachPilot(this);
                }
            }
            // TODO: Handle Phantom II and Sidon Ithano
            return false;
        }

        /**
         * Checks if a pilot can be attached to this unit
         * @param {IUnitCard} pilot The pilot card that would be attached to this unit
         * @returns True if a Pilot can be attached to this unit; false otherwise
         */
        public canAttachPilot(pilot: IUnitCard): boolean {
            if (!this.hasSomeTrait(Trait.Vehicle)) {
                return false;
            }

            // Check if the card can be played with Piloting ignoring the pilot limit,
            // for example "R2-D2, Artooooooooo"
            if (pilot.hasOngoingEffect(EffectName.CanBePlayedWithPilotingIgnoringPilotLimit)) {
                return true;
            }

            // Calculate the pilot limit of the card applying all the modifiers
            const pilotCount = this.upgrades
                .reduce((count, upgrade) => (upgrade.hasSomeTrait(Trait.Pilot) ? count + 1 : count), 0);
            const pilotLimit = this.getOngoingEffectValues<PilotLimitModifier>(EffectName.ModifyPilotLimit)
                .reduce((limit, modifier) => limit + modifier.amount, 1);

            // Ensure that the card doesn't already have the maximum number of pilots
            return pilotCount < pilotLimit;
        }

        /**
         * Removes an upgrade from this card's upgrade list
         * @param upgrade
         */
        public unattachUpgrade(upgrade: IUpgradeCard, event = null) {
            this.assertPropertyEnabledForZone(this.state.upgrades, 'upgrades');
            this.state.upgrades = this.state.upgrades.filter((card) => card.uuid !== upgrade.uuid);
            if (upgrade.getPrintedHp() !== 0) {
                this.lastPlayerToModifyHp = event?.context?.ability ? event.context.ability.controller : upgrade.owner;
            }
        }

        /**
         * Add the passed card to this card's upgrade list. Upgrade must already be moved to the correct arena.
         */
        public attachUpgrade(upgrade: IUpgradeCard) {
            this.assertPropertyEnabledForZone(this.state.upgrades, 'upgrades');
            Contract.assertEqual(upgrade.zoneName, this.zoneName);
            Contract.assertTrue(this.zone.hasCard(upgrade));

            this.state.upgrades.push(upgrade.getRef());

            if (upgrade.getPrintedHp() !== 0) {
                this.lastPlayerToModifyHp = upgrade.controller;
            }
        }

        protected override updateStateOnAttach() {
            this.setActiveAttackEnabled(false);
            this.setDamageEnabled(false);
            this.setExhaustEnabled(false);
            this.setUpgradesEnabled(false);
            this.setCaptureZoneEnabled(false);
        }

        public getMaxUnitAttackLimit(): number {
            let attackLimit = 1;
            if (this.hasOngoingEffect(EffectName.CanAttackMultipleUnitsSimultaneously)) {
                for (const ongoingEffect of this.getOngoingEffectValues(EffectName.CanAttackMultipleUnitsSimultaneously)) {
                    if (ongoingEffect.amount > attackLimit) {
                        attackLimit = ongoingEffect.amount;
                    }
                }
            }
            return attackLimit;
        }

        public override getSummary(activePlayer: Player) {
            if (this.isInPlay()) {
                const hasSentinel = this.hasSomeKeyword(KeywordName.Sentinel);
                const cannotBeAttacked = (this.hasRestriction(AbilityRestriction.BeAttacked) && !hasSentinel);
                const clonedCardSetId = this.hasOngoingEffect(EffectName.CloneUnit) ? this.getOngoingEffectValues<Card>(EffectName.CloneUnit)[0].setId : null;
                const clonedCardTitle = this.hasOngoingEffect(EffectName.CloneUnit) ? this.getOngoingEffectValues<Card>(EffectName.CloneUnit)[0].title : null;

                return {
                    ...super.getSummary(activePlayer),
                    power: this.getPower(),
                    hp: this.getHp(),
                    sentinel: hasSentinel,
                    cannotBeAttacked: cannotBeAttacked,
                    isAttacker: this.isInPlay() && this.isUnit() && (this.isAttacking() || this.controller.getAttackerHighlightingState(this)),
                    isDefender: this.isInPlay() && this.isUnit() && this.isDefending(),
                    clonedCardId: clonedCardSetId,
                    clonedCardName: clonedCardTitle
                };
            }

            return {
                ...super.getSummary(activePlayer),
                parentCardId: this.getCaptor()?.uuid,
            };
        }

        public override getCardState(): any {
            if (this.isInPlay()) {
                return {
                    ...super.getCardState(),
                    upgrades: this.upgrades,
                    capturedUnits: this.capturedUnits
                };
            }
        }

        public override addOngoingEffect(ongoingEffect: OngoingCardEffect): void {
            if (ongoingEffect.type === EffectName.ModifyStats && ongoingEffect?.getValue(this)?.hp !== 0) {
                this.lastPlayerToModifyHp = ongoingEffect.context.source.controller;
                this.state.expiredLastingEffectChangedRemainingHp = false;
            }
            super.addOngoingEffect(ongoingEffect);
        }

        public override removeOngoingEffect(ongoingEffect: OngoingCardEffect): void {
            if (ongoingEffect.type === EffectName.ModifyStats && ongoingEffect?.getValue(this)?.hp !== 0) {
                if (this.game.currentAbilityResolver?.context?.player) {
                    this.lastPlayerToModifyHp = this.game.currentAbilityResolver.context.player;
                }

                this.state.expiredLastingEffectChangedRemainingHp = ongoingEffect.context.ongoingEffect?.isLastingEffect ?? false;
            }
            super.removeOngoingEffect(ongoingEffect);
        }

        // STATE TODO: We need to really dig into what is being updated by resolveAbilitiesForNewZone. We desperately want to remove this onAfter method.
        //              Good rollback code shouldn't need to use this method. Instead all game actions should result in Game State changes, so that when we rollback we never
        //              need to redo the action that causes this; it should all be captured within State.
        public override afterSetAllState(oldState) {
            super.afterSetAllState(oldState);

            // STATE TODO: I don't wholly trust this covers all cases, but it's a good start at least.
            // if (oldState.zone?.uuid !== this.state.zone.uuid) {
            //     const oldZone = this.game.gameObjectManager.get<Zone>(oldState.zone);
            //     this.movedFromZone = oldZone?.name;
            //     // This is a bad work around, if it does change zones, it always resets limits on abilities. We want to reset to the exact state, not call functions to mutate state.
            //     this.resolveAbilitiesForNewZone();
            // }
        }
    };
}
