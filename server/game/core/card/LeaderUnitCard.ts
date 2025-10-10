import type { Player } from '../Player';
import type { ZoneFilter } from '../Constants';
import { CardType, DeployType, RelativePlayer, Trait, WildcardCardType } from '../Constants';
import { AbilityType, ZoneName } from '../Constants';
import type { IUnitAbilityRegistrar, IUnitCard } from './propertyMixins/UnitProperties';
import { WithUnitProperties } from './propertyMixins/UnitProperties';
import * as EnumHelpers from '../utils/EnumHelpers';
import type { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityProps, IAbilityPropsWithType } from '../../Interfaces';
import * as Helpers from '../utils/Helpers';
import * as Contract from '../utils/Contract';
import { EpicActionLimit } from '../ability/AbilityLimit';
import { DeployLeaderSystem } from '../../gameSystems/DeployLeaderSystem';
import type { ActionAbility } from '../ability/ActionAbility';
import type { ILeaderCard } from './propertyMixins/LeaderProperties';
import { WithLeaderProperties } from './propertyMixins/LeaderProperties';
import type { IInPlayCardState } from './baseClasses/InPlayCard';
import { InPlayCard } from './baseClasses/InPlayCard';
import type { ICardDataJson } from '../../../utils/cardData/CardDataInterfaces';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from './AbilityRegistrationInterfaces';
import type TriggeredAbility from '../ability/TriggeredAbility';
import type { Card } from './Card';
import type ReplacementEffectAbility from '../ability/ReplacementEffectAbility';
import type { IAbilityHelper } from '../../AbilityHelper';
import type { ConstantAbility } from '../ability/ConstantAbility';
import { registerState, undoObject } from '../GameObjectUtils';

const LeaderUnitCardParent = WithUnitProperties(WithLeaderProperties(InPlayCard<ILeaderUnitCardState>));

/** Represents a deployable leader in a deployed state (i.e., is also a unit) */
export interface ILeaderUnitCard extends ILeaderCard, IUnitCard {}

// STATE TODO: Obsolete, to be removed.
export type ILeaderUnitCardState = IInPlayCardState;

/** Represents a deployable leader in an undeployed state */
export interface IDeployableLeaderCard extends ILeaderUnitCard {
    get deployed(): boolean;
    deploy(deployProps: { type: DeployType.LeaderUnit } | { type: DeployType.LeaderUpgrade; parentCard: IUnitCard }): void;
    undeploy(): void;
}

@registerState()
export class LeaderUnitCardInternal extends LeaderUnitCardParent implements IDeployableLeaderCard {
    protected setupLeaderUnitSide;

    @undoObject()
    private accessor _deployEpicActionLimit: EpicActionLimit = null;

    protected get deployEpicActionLimit() {
        return this._deployEpicActionLimit;
    }

    private deployEpicActions: ActionAbility[] = [];

    public get deployed() {
        return this._deployed;
    }

    public override getType(): CardType {
        if (this.canBeUpgrade && this.isAttached()) {
            return CardType.LeaderUpgrade;
        }
        return this._deployed ? CardType.LeaderUnit : CardType.Leader;
    }

    public constructor(owner: Player, cardData: ICardDataJson) {
        super(owner, cardData);

        const registrar = this.getAbilityRegistrar();

        // add deploy leader action
        this.deployEpicActions.push(registrar.addActionAbility({
            limit: this.deployEpicActionLimit,
            title: `Deploy ${this.title}`,
            requiresConfirmation: true,
            condition: (context) => context.player.resources.length >= context.source.cost,
            zoneFilter: ZoneName.Base,
            immediateEffect: new DeployLeaderSystem({}),
            ...this.deployActionAbilityProps(this.game.abilityHelper)
        }));

        this.setupLeaderUnitSide = true;
        this.setupLeaderUnitSideAbilities(this.getAbilityRegistrar(), this.game.abilityHelper);
        this.validateCardAbilities(this.triggeredAbilities, cardData.deployBox);
        this._deployEpicActionLimit = new EpicActionLimit(this.game);
    }

    protected deployActionAbilityProps(AbilityHelper: IAbilityHelper): Partial<IActionAbilityProps<this>> {
        return {};
    }

    protected override initializeStateForAbilitySetup() {
        super.initializeStateForAbilitySetup();
        this.deployEpicActions = [];
    }

    public override isUnit(): this is IUnitCard {
        return this._deployed && !this.isAttached();
    }

    public override isDeployableLeader(): this is IDeployableLeaderCard {
        return true;
    }

    public override isLeader(): this is ILeaderCard {
        return true;
    }

    public override isLeaderUnit(): this is ILeaderUnitCard {
        return this.isUnit();
    }

    public override initializeForStartZone(): void {
        super.initializeForStartZone();

        // leaders are always in a zone where they are allowed to be exhausted
        this.setExhaustEnabled(true);
        this.resolveAbilitiesForNewZone();
    }

    public override checkIsAttachable(): void {
        Contract.assertTrue(this.canBeUpgrade);
    }

    /** Deploy the leader to the arena. Handles the move operation and state changes. */
    public deploy(deployProps: { type: DeployType.LeaderUnit } | { type: DeployType.LeaderUpgrade; parentCard: IUnitCard }) {
        Contract.assertFalse(this._deployed, `Attempting to deploy already deployed leader ${this.internalName}`);

        this._deployed = true;

        switch (deployProps.type) {
            case DeployType.LeaderUpgrade:
                this.attachTo(deployProps.parentCard);
                break;
            case DeployType.LeaderUnit:
            default:
                this.moveTo(this.defaultArena);
                break;
        }
    }

    /** Return the leader from the arena to the base zone. Handles the move operation and state changes. */
    public undeploy() {
        Contract.assertTrue(this._deployed, `Attempting to un-deploy leader ${this.internalName} while it is not deployed`);

        this._deployed = false;
        this.moveTo(ZoneName.Base);
    }

    protected override getAbilityRegistrar(): ILeaderUnitAbilityRegistrar & ILeaderUnitLeaderSideAbilityRegistrar {
        const registrar = super.getAbilityRegistrar() as IUnitAbilityRegistrar<LeaderUnitCardInternal>;

        return {
            ...registrar,
            addPilotDeploy: () => this.addPilotDeploy(true, registrar),
        };
    }

    protected override callSetupLeaderWithRegistrar() {
        this.setupLeaderSideAbilities(this.getAbilityRegistrar(), this.game.abilityHelper);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {}

    /**
     * Create card abilities for the leader unit side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
    }

    private addPilotDeploy(makeAttachedUnitALeader: boolean, registrar: IUnitAbilityRegistrar<LeaderUnitCardInternal>) {
        Contract.assertNotNullLike(this.printedUpgradeHp, `Leader ${this.title} is missing upgrade HP.`);
        Contract.assertNotNullLike(this.printedUpgradePower, `Leader ${this.title} is missing upgrade power.`);

        if (makeAttachedUnitALeader) {
            registrar.addPilotingConstantAbilityTargetingAttached({
                title: 'Attached unit is a Leader',
                ongoingEffect: this.game.abilityHelper.ongoingEffects.isLeader()
            });
        }

        this.deployEpicActions.push(registrar.addActionAbility({
            title: `Deploy ${this.title} as a Pilot`,
            requiresConfirmation: true,
            limit: this.deployEpicActionLimit,
            condition: (context) => context.player.resources.length >= context.source.cost,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && card.canAttachPilot(context.source),
                immediateEffect: this.game.abilityHelper.immediateEffects.deployAndAttachPilotLeader((context) => ({
                    leaderPilotCard: context.source
                }))
            }
        }));
    }

    protected override createCoordinateAbilityProps(properties: IAbilityPropsWithType<this>): IAbilityPropsWithType<this> {
        return this.addZoneForSideToAbilityWithType(properties);
    }

    public override createActionAbility<TSource extends Card = this>(properties: IActionAbilityProps<TSource>): ActionAbility {
        if (properties.printedAbility) {
            properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        }

        return super.createActionAbility(properties);
    }

    public override createConstantAbility<TSource extends Card = this>(properties: IConstantAbilityProps<TSource>): ConstantAbility {
        if (properties.printedAbility) {
            properties.sourceZoneFilter = this.getAbilityZonesForSide(properties.sourceZoneFilter);
        }

        return super.createConstantAbility(properties);
    }

    public override createReplacementEffectAbility<TSource extends Card = this>(properties: IReplacementEffectAbilityProps<TSource>): ReplacementEffectAbility {
        if (properties.printedAbility) {
            properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        }

        return super.createReplacementEffectAbility(properties);
    }

    protected override createTriggeredAbility<TSource extends Card = this>(properties: ITriggeredAbilityProps<TSource>): TriggeredAbility {
        if (properties.printedAbility) {
            properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        }

        return super.createTriggeredAbility(properties);
    }

    /** Generates the right zoneFilter property depending on which leader side we're setting up */
    private addZoneForSideToAbilityWithType<Properties extends IAbilityPropsWithType<LeaderUnitCardInternal>>(properties: Properties) {
        if (properties.type === AbilityType.Constant) {
            properties.sourceZoneFilter = this.getAbilityZonesForSide(properties.sourceZoneFilter);
        } else {
            properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        }
        return properties;
    }

    private getAbilityZonesForSide(propertyZone: ZoneFilter | ZoneFilter[]) {
        const abilityZone = this.setupLeaderUnitSide ? this.defaultArena : ZoneName.Base;

        return propertyZone
            ? Helpers.asArray(propertyZone).concat([abilityZone])
            : abilityZone;
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        super.initializeForCurrentZone(prevZone);

        switch (this.zoneName) {
            case ZoneName.GroundArena:
            case ZoneName.SpaceArena:
                this._deployed = true;
                this.setDamageEnabled(true);
                this.setActiveAttackEnabled(true);
                this.setUpgradesEnabled(true);
                this.setExhaustEnabled(true);
                this.exhausted = false;
                this.setCaptureZoneEnabled(true);
                break;

            case ZoneName.Base:
                this._deployed = false;
                this.setDamageEnabled(false);
                this.setActiveAttackEnabled(false);
                this.setUpgradesEnabled(false);
                this.setExhaustEnabled(true);
                this.exhausted = prevZone ? EnumHelpers.isArena(prevZone) : false;
                this.setCaptureZoneEnabled(false);
                break;
        }
    }

    public override getSummary(activePlayer: Player) {
        return {
            ...super.getSummary(activePlayer),
            epicDeployActionSpent: this.deployEpicActionLimit.isAtMax(this.owner)
        };
    }

    public override getCardState(): any {
        return { ...super.getCardState(),
            deployed: this.deployed };
    }
}

// STATE TODO: Once we've fully converted to decorators, this can be removed and LeaderUnitCardInternal can be renamed to LeaderUnitCard
@registerState()
export class LeaderUnitCard extends LeaderUnitCardInternal {
    public declare state: never;
}