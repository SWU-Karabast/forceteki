import { InitiateAttackAction } from '../../../actions/InitiateAttackAction';
import type { Arena } from '../../Constants';
import { AbilityType, CardType, EffectName, EventName, KeywordName, StatType, Trait, WildcardRelativePlayer, ZoneName } from '../../Constants';
import StatsModifierWrapper from '../../ongoingEffect/effectImpl/StatsModifierWrapper';
import type { IOngoingCardEffect } from '../../ongoingEffect/IOngoingCardEffect';
import * as Contract from '../../utils/Contract';
import type { IInPlayCard, InPlayCardConstructor } from '../baseClasses/InPlayCard';
import { InPlayCard } from '../baseClasses/InPlayCard';
import type { ICardWithDamageProperty } from './Damage';
import { WithDamage } from './Damage';
import type { ICardWithPrintedPowerProperty } from './PrintedPower';
import { WithPrintedPower } from './PrintedPower';
import * as EnumHelpers from '../../utils/EnumHelpers';
import type { Card } from '../Card';
import type { IAbilityPropsWithType, IConstantAbilityProps, IKeywordProperties, ITriggeredAbilityBaseProps, ITriggeredAbilityProps } from '../../../Interfaces';
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
import type Player from '../../Player';
import { BountyAbility } from '../../../abilities/keyword/BountyAbility';
import type { IUpgradeCard } from '../CardInterfaces';
import type { ActionAbility } from '../../ability/ActionAbility';

export const UnitPropertiesCard = WithUnitProperties(InPlayCard);

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
    unattachUpgrade(upgrade, event);
    canAttachPilot(): boolean;
    attachUpgrade(upgrade);
    getNumericKeywordSum(keywordName: KeywordName.Exploit | KeywordName.Restore | KeywordName.Raid): number | null;
}

/**
 * Mixin function that adds the standard properties for a unit (leader or non-leader) to a base class.
 * Specifically it gains:
 * - hp, damage, and power (from the corresponding mixins {@link WithPrintedHp}, {@link WithDamage}, and {@link WithPrintedPower})
 * - the ability for hp and power to be modified by effects
 * - the {@link InitiateAttackAction} ability so that the card can attack
 * - the ability to have attached upgrades
 */
export function WithUnitProperties<TBaseClass extends InPlayCardConstructor>(BaseClass: TBaseClass) {
    // create a "base" class that has the damage, hp, and power properties from other mixins
    const StatsAndDamageClass = WithDamage(WithPrintedPower(BaseClass));

    return class AsUnit extends StatsAndDamageClass implements IUnitCard {
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

        protected _captureZone?: CaptureZone = null;
        protected _upgrades?: IUpgradeCard[] = null;
        protected pilotingActionAbilities: ActionAbility[];
        protected pilotingConstantAbilities: IConstantAbility[];
        protected pilotingTriggeredAbilities: TriggeredAbility[];

        private readonly attackAction: InitiateAttackAction;
        private _attackKeywordAbilities?: (TriggeredAbility | IConstantAbility)[] = null;
        private _lastPlayerToModifyHp?: Player;
        private _whenCapturedKeywordAbilities?: TriggeredAbility[] = null;
        private _whenDefeatedKeywordAbilities?: TriggeredAbility[] = null;
        private _whenPlayedKeywordAbilities?: TriggeredAbility[] = null;
        private _whileInPlayKeywordAbilities?: IConstantAbility[] = null;

        public get capturedUnits() {
            this.assertPropertyEnabledForZone(this._captureZone, 'capturedUnits');
            return this._captureZone.cards;
        }

        public get captureZone() {
            this.assertPropertyEnabledForZone(this._captureZone, 'captureZone');
            return this._captureZone;
        }

        public get upgrades(): IUpgradeCard[] {
            this.assertPropertyEnabledForZone(this._upgrades, 'upgrades');
            return this._upgrades;
        }

        public getCaptor(): IUnitCard | null {
            if (this.zone.name !== ZoneName.Capture) {
                return null;
            }

            return this.zone.captor as IUnitCard;
        }

        public isAttacking(): boolean {
            return (this as Card) === (this.activeAttack?.attacker as Card);
        }

        public isCaptured(): boolean {
            return this.zoneName === ZoneName.Capture;
        }

        public isUpgraded(): boolean {
            return this.upgrades.length > 0;
        }

        public hasShield(): boolean {
            return this.upgrades.some((card) => card.isShield());
        }

        public override isUpgrade(): this is IUpgradeCard {
            return this._parentCard !== null;
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
            }

            this.attackAction = new InitiateAttackAction(this.game, this);
        }

        protected override initializeStateForAbilitySetup() {
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
            return this._parentCard === null;
        }

        protected override getType(): CardType {
            return this.isAttached() ? CardType.UnitUpgrade : this.printedType;
        }

        protected setCaptureZoneEnabled(enabledStatus: boolean) {
            this._captureZone = enabledStatus ? new CaptureZone(this.owner, this) : null;
        }

        protected override setDamageEnabled(enabledStatus: boolean): void {
            super.setDamageEnabled(enabledStatus);
        }

        protected setUpgradesEnabled(enabledStatus: boolean) {
            this._upgrades = enabledStatus ? [] : null;
        }

        // ***************************************** MISC HELPERS *****************************************
        /**
         * Check if there are any effect restrictions preventing this unit from attacking the passed target.
         * Returns true if so.
         */
        public effectsPreventAttack(target: Card) {
            if (this.hasOngoingEffect(EffectName.CannotAttackBase) && target.isBase()) {
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

        // ***************************************** ABILITY HELPERS *****************************************
        public override getActions() {
            if (this.getType() === CardType.UnitUpgrade) {
                return this.pilotingActionAbilities;
            }

            return super.getActions().concat(this.attackAction);
        }

        protected addOnAttackAbility(properties: Omit<ITriggeredAbilityProps<this>, 'when' | 'aggregateWhen'>): void {
            const triggeredProperties = { ...properties, when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source } };
            this.addTriggeredAbility(triggeredProperties);
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
            Contract.assertTrue(
                this.printedKeywords.some((keyword) => keyword.name === KeywordName.Piloting),
                `Attempting to add a piloting ability '${properties.title}' to ${this.internalName} but it has no printed instances of the Piloting keyword`
            );

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
                default:
                    Contract.fail(`Unsupported ability type ${properties.type}`);
            }
        }

        protected addPilotingConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<this>, 'title' | 'condition' | 'matchTarget' | 'ongoingEffect'>) {
            this.addPilotingAbility({
                type: AbilityType.Constant,
                title: properties.title,
                matchTarget: (card, context) => card === context.source.parentCard,
                targetController: WildcardRelativePlayer.Any,   // this means that the effect continues to work even if the other player gains control of the upgrade
                ongoingEffect: properties.ongoingEffect
            });
        }

        public addPilotingGainKeywordTargetingAttached(properties: IKeywordProperties) {
            this.addPilotingConstantAbilityTargetingAttached({
                title: 'Give keyword to the attached card',
                ongoingEffect: OngoingEffectLibrary.gainKeyword(properties)
            });
        }

        public override getTriggeredAbilities(): TriggeredAbility[] {
            let triggeredAbilities = this.getType() === CardType.UnitUpgrade ? this.pilotingTriggeredAbilities : super.getTriggeredAbilities();

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
            let constantAbilities = this.getType() === CardType.UnitUpgrade ? this.pilotingConstantAbilities : super.getConstantAbilities();

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
            let abilitiesToUpdate: TriggeredAbility[];

            // if not piloting, just use default behavior
            if (EnumHelpers.isArena(to)) {
                abilitiesToUpdate = this.getType() === CardType.UnitUpgrade ? this.pilotingTriggeredAbilities : this.triggeredAbilities;
            } else {
                abilitiesToUpdate = this.pilotingTriggeredAbilities.concat(this.triggeredAbilities);
            }

            super.updateTriggeredAbilityEventsInternal(abilitiesToUpdate, from, to);
        }

        protected override updateConstantAbilityEffects(from: ZoneName, to: ZoneName): void {
            let abilitiesToUpdate: IConstantAbility[];

            // if not piloting, just use default behavior
            if (EnumHelpers.isArena(to)) {
                abilitiesToUpdate = this.getType() === CardType.UnitUpgrade ? this.pilotingConstantAbilities : this.constantAbilities;
            } else {
                abilitiesToUpdate = this.pilotingConstantAbilities.concat(this.constantAbilities);
            }

            super.updateConstantAbilityEffectsInternal(abilitiesToUpdate, from, to);
        }

        /** Register / un-register the effects for any abilities from keywords */
        protected override updateKeywordAbilityEffects(from: ZoneName, to: ZoneName) {
            // Unregister all effects when moving a card from an arena to a non-arena zone
            // or from a base to an arena
            if ((EnumHelpers.isArena(from) && !EnumHelpers.isArena(to)) || (from === ZoneName.Base && EnumHelpers.isArena(to))) {
                Contract.assertTrue(Array.isArray(this._whileInPlayKeywordAbilities), 'Keyword ability while in play registration was skipped');

                for (const keywordAbility of this._whileInPlayKeywordAbilities) {
                    this.removeEffectFromEngine(keywordAbility.registeredEffects);
                    keywordAbility.registeredEffects = [];
                }

                this._whileInPlayKeywordAbilities = null;
            }

            // Register all effects when moving a card to a base or from a non-arena zone to an arena,
            // this is to support leaders with the Coordinate keyword
            if ((!EnumHelpers.isArena(from) && EnumHelpers.isArena(to)) || to === ZoneName.Base) {
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
                const restoreAmount = this.getNumericKeywordSum(KeywordName.Restore);
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
            const bountyKeywords = this.getBountyAbilities();
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
            const bountyKeywords = this.getBountyAbilities();
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

        private getBountyAbilities() {
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

            if (this.damage >= this.getHp() && !this._pendingDefeat) {
                // add defeat event to window
                this.game.addSubwindowEvents(
                    new FrameworkDefeatCardSystem({ target: this, defeatSource: source })
                        .generateEvent(this.game.getFrameworkContext())
                );

                // mark that this unit has a defeat pending so that other effects targeting it will not resolve
                this._pendingDefeat = true;
            }
        }

        private getModifiedStatValue(statType: StatType, floor = true, excludeModifiers = []) {
            const wrappedModifiers = this.getStatModifiers(excludeModifiers);

            const baseStatValue = StatsModifierWrapper.fromPrintedValues(this);

            const stat = wrappedModifiers.reduce((total, wrappedModifier) => total + wrappedModifier.modifier[statType], baseStatValue.modifier[statType]);

            return floor ? Math.max(0, stat) : stat;
        }

        // TODO: add a summary method that logs these modifiers (i.e., the names, amounts, etc.)
        private getStatModifiers(exclusions): StatsModifierWrapper[] {
            if (!exclusions) {
                exclusions = [];
            }

            let rawEffects;
            if (typeof exclusions === 'function') {
                rawEffects = this.getOngoingEffects().filter((effect) => !exclusions(effect));
            } else {
                rawEffects = this.getOngoingEffects().filter((effect) => !exclusions.includes(effect.type));
            }

            const modifierEffects: IOngoingCardEffect[] = rawEffects.filter((effect) => effect.type === EffectName.ModifyStats);
            const wrappedStatsModifiers = modifierEffects.map((modifierEffect) => StatsModifierWrapper.fromEffect(modifierEffect, this));

            // add stat bonuses from attached upgrades
            this.upgrades.forEach((upgrade) => wrappedStatsModifiers.push(StatsModifierWrapper.fromPrintedValues(upgrade)));

            if (this.hasSomeKeyword(KeywordName.Grit)) {
                const gritModifier = { power: this.damage, hp: 0 };
                wrappedStatsModifiers.push(new StatsModifierWrapper(gritModifier, 'Grit', false, this.type));
            }

            const raidAmount = this.getNumericKeywordSum(KeywordName.Raid);
            if (this.isAttacking() && raidAmount > 0) {
                const raidModifier = { power: raidAmount, hp: 0 };
                wrappedStatsModifiers.push(new StatsModifierWrapper(raidModifier, 'Raid', false, this.type));
            }

            return wrappedStatsModifiers;
        }


        public override checkIsAttachable(): void {
            Contract.assertTrue(this.hasSomeKeyword(KeywordName.Piloting));
        }

        /**
         *  This should only be called if a unit is a Pilot or has some other ability that lets it attach as an upgrade
         * @param {Card} targetCard The card that this would be attached to
         * @param {Player} controller The controller of this card
         * @returns True if this is allowed to attach to the targetCard; false otherwise
         */
        public override canAttach(targetCard: Card, controller: Player = this.controller): boolean {
            Contract.assertTrue(this.canBeUpgrade);
            if (this.hasSomeKeyword(KeywordName.Piloting) && targetCard.isUnit()) {
                return targetCard.canAttachPilot() && targetCard.controller === controller;
            }
            // TODO: Handle Phantom II and Sidon Ithano
            return false;
        }

        /**
         * Checks if a pilot can be attached to this unit
         * @returns True if a Pilot can be attached to this unit; false otherwise
         */
        public canAttachPilot(): boolean {
            if (!this.hasSomeTrait(Trait.Vehicle)) {
                return false;
            }

            // TODO: we need logic for cards that override the pilot limit
            if (this.upgrades.length > 0) {
                return !this.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot));
            }
            return true;
        }

        /**
         * Removes an upgrade from this card's upgrade list
         * @param {UpgradeCard} upgrade
         */
        public unattachUpgrade(upgrade, event = null) {
            this.assertPropertyEnabledForZone(this._upgrades, 'upgrades');
            this._upgrades = this._upgrades.filter((card) => card.uuid !== upgrade.uuid);
            if (upgrade.printedHp !== 0) {
                this._lastPlayerToModifyHp = event?.context?.ability ? event.context.ability.controller : upgrade.owner;
            }
        }

        /**
         * Add the passed card to this card's upgrade list. Upgrade must already be moved to the correct arena.
         */
        public attachUpgrade(upgrade) {
            this.assertPropertyEnabledForZone(this._upgrades, 'upgrades');
            Contract.assertEqual(upgrade.zoneName, this.zoneName);
            Contract.assertTrue(this.zone.hasCard(upgrade));

            this._upgrades.push(upgrade);

            if (upgrade.printedHp !== 0) {
                this._lastPlayerToModifyHp = upgrade.controller;
            }
        }

        public override getSummary(activePlayer: Player) {
            if (this.isInPlay()) {
                // Check for sentinel keyword and no blanking effects
                const keywords = this.keywords;
                const sentinelKeyword = keywords.find(
                    (keyword) => keyword.name === 'sentinel' && !keyword.isBlank
                );

                // If sentinelKeyword is found and has no blanking effects, sentinel is true
                const hasSentinel = !!sentinelKeyword;

                return {
                    ...super.getSummary(activePlayer),
                    power: this.getPower(),
                    hp: this.getHp(),
                    sentinel: hasSentinel
                };
            }
            return {
                ...super.getSummary(activePlayer),
                parentCardId: this.getCaptor()?.uuid,
            };
        }

        public override addOngoingEffect(ongoingEffect: IOngoingCardEffect): void {
            if (ongoingEffect.type === EffectName.ModifyStats && ongoingEffect?.getValue(this)?.hp !== 0) {
                this._lastPlayerToModifyHp = ongoingEffect.context.source.controller;
            }
            super.addOngoingEffect(ongoingEffect);
        }

        public get lastPlayerToModifyHp() {
            Contract.assertTrue(this.isInPlay());
            return this._lastPlayerToModifyHp;
        }
    };
}
