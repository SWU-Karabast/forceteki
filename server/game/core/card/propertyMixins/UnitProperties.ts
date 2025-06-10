import { InitiateAttackAction } from '../../../actions/InitiateAttackAction';
import type { Arena, MoveZoneDestination } from '../../Constants';
import { AbilityRestriction, AbilityType, CardType, EffectName, EventName, KeywordName, PlayType, StandardTriggeredAbilityType, StatType, Trait, WildcardRelativePlayer, ZoneName } from '../../Constants';
import StatsModifierWrapper from '../../ongoingEffect/effectImpl/StatsModifierWrapper';
import type { IOngoingCardEffect } from '../../ongoingEffect/IOngoingCardEffect';
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
import type { IAbilityPropsWithType, IConstantAbilityProps, IGainCondition, IKeywordPropertiesWithGainCondition, ITriggeredAbilityBaseProps, ITriggeredAbilityProps, ITriggeredAbilityPropsWithGainCondition, WhenTypeOrStandard, Zone } from '../../../Interfaces';
import { BountyKeywordInstance } from '../../ability/KeywordInstance';
import { KeywordWithAbilityDefinition } from '../../ability/KeywordInstance';
import TriggeredAbility from '../../ability/TriggeredAbility';
import type { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import { RestoreAbility } from '../../../abilities/keyword/RestoreAbility';
import { ShieldedAbility } from '../../../abilities/keyword/ShieldedAbility';
import { SaboteurDefeatShieldsAbility } from '../../../abilities/keyword/SaboteurDefeatShieldsAbility';
import { AmbushAbility } from '../../../abilities/keyword/AmbushAbility';
import type Game from '../../Game';
import type { GameEvent } from '../../event/GameEvent';
import type { IDamageSource } from '../../../IDamageOrDefeatSource';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';
import { FrameworkDefeatCardSystem } from '../../../gameSystems/FrameworkDefeatCardSystem';
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
import AbilityHelper from '../../../AbilityHelper';

export const UnitPropertiesCard = WithUnitProperties(InPlayCard);
export interface IUnitPropertiesCardState extends IInPlayCardState {
    defaultArenaInternal: Arena;
    captureZone: GameObjectRef<CaptureZone> | null;
    lastPlayerToModifyHp?: GameObjectRef<Player>;
    upgrades: GameObjectRef<IUpgradeCard>[] | null;
}

type IAbilityPropsWithGainCondition<TSource extends IUpgradeCard, TTarget extends Card> = IAbilityPropsWithType<TTarget> & IGainCondition<TSource>;

export interface IUnitCard extends IInPlayCard, ICardWithDamageProperty, ICardWithPrintedPowerProperty {
    get defaultArena(): Arena;
    get capturedUnits(): IUnitCard[];
    get captureZone(): CaptureZone;
    get lastPlayerToModifyHp(): Player;
    readonly upgrades: IUpgradeCard[];
    getCaptor(): IUnitCard | null;
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
        public readonly defaultArena: Arena;

        protected pilotingActionAbilities: ActionAbility[];
        protected pilotingConstantAbilities: IConstantAbility[];
        protected pilotingTriggeredAbilities: TriggeredAbility[];

        private _attackKeywordAbilities?: (TriggeredAbility | IConstantAbility)[] = null;
        public get lastPlayerToModifyHp(): Player {
            Contract.assertTrue(this.isInPlay());
            return this.game.gameObjectManager.get(this.state.lastPlayerToModifyHp);
        }

        private set lastPlayerToModifyHp(value: Player) {
            this.state.lastPlayerToModifyHp = value?.getRef();
        }

        private _whenCapturedKeywordAbilities?: TriggeredAbility[] = null;
        private _whenDefeatedKeywordAbilities?: TriggeredAbility[] = null;
        private _whenPlayedKeywordAbilities?: TriggeredAbility[] = null;
        private _whileInPlayKeywordAbilities?: IConstantAbility[] = null;

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

        public getCaptor(): IUnitCard | null {
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
                    this.defaultArena = ZoneName.SpaceArena;
                    break;
                case 'ground':
                    this.defaultArena = ZoneName.GroundArena;
                    break;
                default:
                    Contract.fail(`Unknown arena type in card data: ${cardData.arena}`);
            }

            if (this.hasSomeKeyword(KeywordName.Piloting)) {
                Contract.assertNotNullLike(cardData.upgradeHp, `Card ${this.internalName} is missing upgradeHp`);
                Contract.assertNotNullLike(cardData.upgradePower, `Card ${this.internalName} is missing upgradePower`);

                this.validateCardAbilities(this.pilotingTriggeredAbilities, cardData.pilotText);
            }

            this._cardsPlayedThisWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(this.owner.game.stateWatcherRegistrar, this);
            this._leadersDeployedThisPhaseWatcher = AbilityHelper.stateWatchers.leadersDeployedThisPhase(this.owner.game.stateWatcherRegistrar, this);
        }

        protected override setupDefaultState() {
            super.setupDefaultState();
            this.state.upgrades = null;
        }

        protected override initializeStateForAbilitySetup() {
            super.initializeStateForAbilitySetup();
            this.pilotingActionAbilities = [];
            this.pilotingConstantAbilities = [];
            this.pilotingTriggeredAbilities = [];
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
        public override getActions() {
            if (EnumHelpers.isUnitUpgrade(this.getType())) {
                return this.pilotingActionAbilities;
            }

            const actions = super.getActions().concat(new InitiateAttackAction(this.game, this));

            // If this unit must attack and an attack action is available, return just that action.
            // This is used by cards such as Give In to Your Anger
            if (this.hasOngoingEffect(EffectName.MustAttack) && actions.some((action) => action.isAttackAction() && action.meetsRequirements() === '')) {
                return actions.filter((action) => action.isAttackAction());
            }

            return actions;
        }

        protected addOnAttackAbility(properties: Omit<ITriggeredAbilityProps<this>, 'when' | 'aggregateWhen'>): void {
            const when: WhenTypeOrStandard = { [StandardTriggeredAbilityType.OnAttack]: true };
            this.addTriggeredAbility({ ...properties, when });
        }

        protected addBountyAbility(properties: Omit<ITriggeredAbilityBaseProps<this>, 'canBeTriggeredBy'>): void {
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
            Contract.assertTrue(bountyAbilityToAssign instanceof BountyKeywordInstance);
            bountyAbilityToAssign.setAbilityProps(properties);
        }

        protected addCoordinateAbility(properties: IAbilityPropsWithType<this>): void {
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
            coordinateAbilityToAssign.setAbilityProps(properties);
        }

        protected addPilotingAbility(properties: IAbilityPropsWithType<this>): void {
            this.checkIsAttachable();

            switch (properties.type) {
                case AbilityType.Action:
                    this.pilotingActionAbilities.push(this.createActionAbility(properties));
                    break;
                case AbilityType.Constant:
                    this.pilotingConstantAbilities.push(this.createConstantAbility(properties));
                    break;
                case AbilityType.Triggered:
                    this.pilotingTriggeredAbilities.push(this.createTriggeredAbility(properties));
                    break;
                case AbilityType.ReplacementEffect:
                    this.pilotingTriggeredAbilities.push(this.createReplacementEffectAbility(properties));
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

        protected addPilotingConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<this>, 'title' | 'condition' | 'ongoingEffect'>) {
            this.addPilotingAbility({
                type: AbilityType.Constant,
                title: properties.title,
                matchTarget: (card, context) => card === context.source.parentCard,
                targetController: WildcardRelativePlayer.Any,   // this means that the effect continues to work even if the other player gains control of the upgrade
                condition: this.addZoneCheckToGainCondition(properties.condition),
                ongoingEffect: properties.ongoingEffect
            });
        }

        public addPilotingGainKeywordTargetingAttached(properties: IKeywordPropertiesWithGainCondition<this>) {
            const { gainCondition, ...gainedKeywordProperties } = properties;

            this.addPilotingConstantAbilityTargetingAttached({
                title: 'Give keyword to the attached card',
                condition: this.addZoneCheckToGainCondition(gainCondition),
                ongoingEffect: OngoingEffectLibrary.gainKeyword(gainedKeywordProperties)
            });
        }

        public addPilotingGainAbilityTargetingAttached(properties: IAbilityPropsWithGainCondition<this, IUnitCard>) {
            const { gainCondition, ...gainedAbilityProperties } = properties;

            this.addPilotingConstantAbilityTargetingAttached({
                title: 'Give ability to the attached card',
                condition: this.addZoneCheckToGainCondition(gainCondition),
                ongoingEffect: OngoingEffectLibrary.gainAbility(gainedAbilityProperties)
            });
        }

        public addPilotingGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityPropsWithGainCondition<this, IUnitCard>) {
            this.addPilotingGainAbilityTargetingAttached({
                type: AbilityType.Triggered,
                title: 'Give triggered ability to the attached card',
                ...properties
            });
        }

        public override getTriggeredAbilities(): TriggeredAbility[] {
            if (this.isBlank()) {
                return [];
            }

            if (EnumHelpers.isUnitUpgrade(this.getType())) {
                return this.pilotingTriggeredAbilities;
            }

            let triggeredAbilities = EnumHelpers.isUnitUpgrade(this.getType()) ? this.pilotingTriggeredAbilities : super.getTriggeredAbilities();

            // add any temporarily registered attack abilities from keywords
            if (this._attackKeywordAbilities !== null) {
                triggeredAbilities = triggeredAbilities.concat(this._attackKeywordAbilities.filter((ability) => ability instanceof TriggeredAbility));
            }
            if (this._whenCapturedKeywordAbilities !== null) {
                triggeredAbilities = triggeredAbilities.concat(this._whenCapturedKeywordAbilities);
            }
            if (this._whenDefeatedKeywordAbilities !== null) {
                triggeredAbilities = triggeredAbilities.concat(this._whenDefeatedKeywordAbilities);
            }
            if (this._whenPlayedKeywordAbilities !== null) {
                triggeredAbilities = triggeredAbilities.concat(this._whenPlayedKeywordAbilities);
            }

            return triggeredAbilities;
        }

        public override getConstantAbilities(): IConstantAbility[] {
            if (this.isBlank()) {
                return [];
            }

            if (EnumHelpers.isUnitUpgrade(this.getType())) {
                return this.pilotingConstantAbilities;
            }

            let constantAbilities = EnumHelpers.isUnitUpgrade(this.getType()) ? this.pilotingConstantAbilities : super.getConstantAbilities();

            // add any temporarily registered attack abilities from keywords
            if (this._attackKeywordAbilities !== null) {
                constantAbilities = constantAbilities.concat(
                    this._attackKeywordAbilities.filter((ability) => !(ability instanceof TriggeredAbility))
                        .map((ability) => ability as IConstantAbility)
                );
            }

            // add any registered abilities from keywords effective while in play
            if (this._whileInPlayKeywordAbilities !== null) {
                constantAbilities = constantAbilities.concat(this._whileInPlayKeywordAbilities);
            }

            return constantAbilities;
        }

        protected override updateTriggeredAbilitiesForZone(from: ZoneName, to: ZoneName) {
            super.updateTriggeredAbilityEventsInternal(this.pilotingTriggeredAbilities.concat(this.triggeredAbilities), from, to);
        }

        protected override updateConstantAbilityEffects(from: ZoneName, to: ZoneName): void {
            super.updateConstantAbilityEffectsInternal(this.pilotingConstantAbilities.concat(this.constantAbilities), from, to, true);
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
            Contract.assertTrue(Array.isArray(this._whileInPlayKeywordAbilities), 'Keyword ability while in play registration was skipped');

            for (const keywordAbility of this._whileInPlayKeywordAbilities) {
                this.removeEffectFromEngine(keywordAbility.registeredEffects);
                keywordAbility.registeredEffects = [];
            }

            this._whileInPlayKeywordAbilities = null;
        }

        private registerWhileInPlayKeywordAbilityEffects() {
            Contract.assertIsNullLike(
                this._whileInPlayKeywordAbilities,
                `Failed to unregister when played abilities from previous play: ${this._whileInPlayKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this._whileInPlayKeywordAbilities = [];

            for (const keywordInstance of this.getCoordinateAbilities()) {
                const gainedAbilityProps = keywordInstance.abilityProps;

                const coordinateKeywordAbilityProps: IConstantAbilityProps = {
                    title: `Coordinate: ${gainedAbilityProps.title}`,
                    condition: (context) => context.player.getArenaUnits().length >= 3 && !keywordInstance.isBlank,
                    ongoingEffect: OngoingEffectLibrary.gainAbility(gainedAbilityProps)
                };

                const coordinateKeywordAbility = this.createConstantAbility(coordinateKeywordAbilityProps);
                coordinateKeywordAbility.registeredEffects = this.addEffectToEngine(coordinateKeywordAbility);

                this._whileInPlayKeywordAbilities.push(coordinateKeywordAbility);
            }

            if (this.hasSomeKeyword(KeywordName.Hidden)) {
                const hiddenKeywordAbilityProps: IConstantAbilityProps<this> = {
                    title: 'Hidden',
                    condition: (context) => context.source.isInPlay() && this.wasPlayedThisPhase(context.source),
                    ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
                };

                const hiddenKeywordAbility = this.createConstantAbility(hiddenKeywordAbilityProps);
                hiddenKeywordAbility.registeredEffects = this.addEffectToEngine(hiddenKeywordAbility);

                this._whileInPlayKeywordAbilities.push(hiddenKeywordAbility);
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
                this._whenPlayedKeywordAbilities,
                `Failed to unregister when played abilities from previous play: ${this._whenPlayedKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this._whenPlayedKeywordAbilities = [];

            if (hasAmbush) {
                const ambushProps = Object.assign(this.buildGeneralAbilityProps('keyword_ambush'), AmbushAbility.buildAmbushAbilityProperties());
                const ambushAbility = this.createTriggeredAbility(ambushProps);
                ambushAbility.registerEvents();
                this._whenPlayedKeywordAbilities.push(ambushAbility);
            }

            if (hasShielded) {
                const shieldedProps = Object.assign(this.buildGeneralAbilityProps('keyword_shielded'), ShieldedAbility.buildShieldedAbilityProperties());
                const shieldedAbility = this.createTriggeredAbility(shieldedProps);
                shieldedAbility.registerEvents();
                this._whenPlayedKeywordAbilities.push(shieldedAbility);
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
                this._attackKeywordAbilities,
                `Failed to unregister on attack abilities from previous attack: ${this._attackKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this._attackKeywordAbilities = [];

            if (hasRestore) {
                const restoreAmount = this.getNumericKeywordTotal(KeywordName.Restore);
                const restoreProps = Object.assign(this.buildGeneralAbilityProps('keyword_restore'), RestoreAbility.buildRestoreAbilityProperties(restoreAmount));
                const restoreAbility = this.createTriggeredAbility(restoreProps);
                restoreAbility.registerEvents();
                this._attackKeywordAbilities.push(restoreAbility);
            }

            if (hasSaboteur) {
                const saboteurProps = Object.assign(this.buildGeneralAbilityProps('keyword_saboteur'), SaboteurDefeatShieldsAbility.buildSaboteurAbilityProperties());
                const saboteurAbility = this.createTriggeredAbility(saboteurProps);
                saboteurAbility.registerEvents();
                this._attackKeywordAbilities.push(saboteurAbility);
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
                this._whenDefeatedKeywordAbilities,
                `Failed to unregister when defeated abilities from previous defeat: ${this._whenDefeatedKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this._whenDefeatedKeywordAbilities = this.registerBountyKeywords(bountyKeywords);

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
                this._whenCapturedKeywordAbilities,
                `Failed to unregister when captured abilities from previous capture: ${this._whenCapturedKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            );

            this._whenCapturedKeywordAbilities = this.registerBountyKeywords(bountyKeywords);

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
            Contract.assertTrue(Array.isArray(this._whenPlayedKeywordAbilities), 'Keyword ability when played registration was skipped');

            for (const ability of this._whenPlayedKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                }
            }

            this._whenPlayedKeywordAbilities = null;
        }

        /**
         * Unregisters any keywords which need to be explicitly registered for the attack process.
         * These should be unregistered after the end of the attack.
         */
        public unregisterAttackKeywords() {
            Contract.assertTrue(Array.isArray(this._attackKeywordAbilities), 'Keyword ability attack registration was skipped');

            for (const ability of this._attackKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                } else {
                    this.removeEffectFromEngine(ability.registeredEffects[0]);
                }
            }

            this._attackKeywordAbilities = null;
        }

        public unregisterWhenDefeatedKeywords() {
            Contract.assertTrue(Array.isArray(this._whenDefeatedKeywordAbilities), 'Keyword ability when defeated registration was skipped');

            for (const ability of this._whenDefeatedKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                }
            }

            this._whenDefeatedKeywordAbilities = null;
        }

        public unregisterWhenCapturedKeywords() {
            Contract.assertTrue(Array.isArray(this._whenCapturedKeywordAbilities), 'Keyword ability when captured registration was skipped');

            for (const ability of this._whenCapturedKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                }
            }

            this._whenCapturedKeywordAbilities = null;
        }

        // ***************************************** STAT HELPERS *****************************************
        public override addDamage(amount: number, source: IDamageSource): number {
            const damageAdded = super.addDamage(amount, source);

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
                // add defeat event to window
                this.game.addSubwindowEvents(
                    new FrameworkDefeatCardSystem({ target: this, defeatSource: source })
                        .generateEvent(this.game.getFrameworkContext())
                );

                // mark that this unit has a defeat pending so that other effects targeting it will not resolve
                this.state.pendingDefeat = true;
            }
        }

        private getModifiedStatValue(statType: StatType, floor = true, excludeModifiers: string[] = []) {
            const wrappedModifiers = this.getStatModifiers(excludeModifiers);

            const baseStatValue = StatsModifierWrapper.fromPrintedValues(this);

            const stat = wrappedModifiers.reduce((total, wrappedModifier) => total + wrappedModifier.modifier[statType], baseStatValue.modifier[statType]);

            return floor ? Math.max(0, stat) : stat;
        }

        // TODO: add a summary method that logs these modifiers (i.e., the names, amounts, etc.)
        private getStatModifiers(exclusions: (string[] | ((effect: IOngoingCardEffect) => boolean)) = []): StatsModifierWrapper[] {
            let rawEffects: IOngoingCardEffect[];
            if (typeof exclusions === 'function') {
                rawEffects = this.getOngoingEffects().filter((effect) => !exclusions(effect));
            } else {
                rawEffects = this.getOngoingEffects().filter((effect) => !exclusions.includes(effect.type));
            }

            const modifierEffects: IOngoingCardEffect[] = rawEffects.filter((effect) => effect.type === EffectName.ModifyStats);
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
                const isHidden = !hasSentinel && this.hasSomeKeyword(KeywordName.Hidden) && this.wasPlayedThisPhase();

                return {
                    ...super.getSummary(activePlayer),
                    power: this.getPower(),
                    hp: this.getHp(),
                    sentinel: hasSentinel,
                    hidden: isHidden,
                    isAttacker: this.isInPlay() && this.isUnit() && (this.isAttacking() || this.controller.getAttackerHighlightingState(this)),
                    isDefender: this.isInPlay() && this.isUnit() && this.isDefending(),
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

        public override addOngoingEffect(ongoingEffect: IOngoingCardEffect): void {
            if (ongoingEffect.type === EffectName.ModifyStats && ongoingEffect?.getValue(this)?.hp !== 0) {
                this.lastPlayerToModifyHp = ongoingEffect.context.source.controller;
            }
            super.addOngoingEffect(ongoingEffect);
        }

        protected override afterSetState(oldState) {
            super.afterSetState(oldState);
            // STATE: I don't wholly trust this covers all cases, but it's a good start at least.
            if (oldState.zone?.uuid !== this.state.zone.uuid) {
                const oldZone = this.game.gameObjectManager.get<Zone>(oldState.zone);
                this.movedFromZone = oldZone?.name;
                this.resolveAbilitiesForNewZone();
            }
        }
    };
}
