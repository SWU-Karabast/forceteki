import type Player from '../Player';
import type { ZoneFilter } from '../Constants';
import { CardType, DeployType, RelativePlayer, Trait, WildcardCardType } from '../Constants';
import { AbilityType, ZoneName } from '../Constants';
import type { IUnitCard } from './propertyMixins/UnitProperties';
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
import { InPlayCard } from './baseClasses/InPlayCard';
import AbilityHelper from '../../AbilityHelper';

const LeaderUnitCardParent = WithUnitProperties(WithLeaderProperties(InPlayCard));

/** Represents a deployable leader in an undeployed state */
export interface IDeployableLeaderCard extends ILeaderCard {
    get deployed(): boolean;
    deploy(deployType: DeployType): void;
    undeploy(): void;
}

/** Represents a deployable leader in a deployed state (i.e., is also a unit) */
export interface ILeaderUnitCard extends IDeployableLeaderCard, IUnitCard {}

export class LeaderUnitCard extends LeaderUnitCardParent implements ILeaderUnitCard {
    protected _deployed = false;
    protected setupLeaderUnitSide;
    protected deployEpicActionLimit: EpicActionLimit;
    protected deployEpicActions: ActionAbility[];

    public get deployed() {
        return this._deployed;
    }

    public override getType(): CardType {
        if (this.canBeUpgrade && this.isAttached()) {
            return CardType.UnitUpgrade;
        }
        return this._deployed ? CardType.LeaderUnit : CardType.Leader;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // add deploy leader action
        this.deployEpicActions.push(this.addActionAbility({
            title: `Deploy ${this.title}`,
            limit: this.deployEpicActionLimit,
            condition: (context) => context.player.resources.length >= context.source.cost,
            zoneFilter: ZoneName.Base,
            immediateEffect: new DeployLeaderSystem({
                deployType: DeployType.LeaderUnit
            })
        }));

        this.setupLeaderUnitSide = true;
        this.setupLeaderUnitSideAbilities(this);
    }

    protected override initializeStateForAbilitySetup() {
        super.initializeStateForAbilitySetup();
        this.deployEpicActions = [];
        this.deployEpicActionLimit = new EpicActionLimit();
    }

    public override isUnit(): this is IUnitCard {
        return this._deployed;
    }

    public override isDeployableLeader(): this is IDeployableLeaderCard {
        return true;
    }

    public override isLeader(): this is ILeaderCard {
        return true;
    }

    public override isLeaderUnit(): this is ILeaderUnitCard {
        return this._deployed;
    }

    public override initializeForStartZone(): void {
        super.initializeForStartZone();

        // leaders are always in a zone where they are allowed to be exhausted
        this.setExhaustEnabled(true);
        this.resolveAbilitiesForNewZone();
    }

    /** Deploy the leader to the arena. Handles the move operation and state changes. */
    public deploy(deployType: DeployType, parentCard?: IUnitCard) {
        Contract.assertFalse(this._deployed, `Attempting to deploy already deployed leader ${this.internalName}`);

        this._deployed = true;

        switch (deployType) {
            case DeployType.LeaderUpgrade:
                this.attachTo(parentCard);
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

    /**
     * Create card abilities for the leader unit side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderUnitSideAbilities(sourceCard: this) {
    }

    protected addPilotDeploy() {
        this.deployEpicActions.push(this.addActionAbility({
            title: `Deploy ${this.title} as a Pilot`,
            limit: this.deployEpicActionLimit,
            condition: (context) => context.player.resources.length >= context.source.cost,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && card.canAttachPilot(),
                immediateEffect: AbilityHelper.immediateEffects.deployAndAttachPilotLeader((context) => ({
                    leaderPilotCard: context.source
                }))
            }
        }));
    }

    protected override addActionAbility(properties: IActionAbilityProps<this>) {
        properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        return super.addActionAbility(properties);
    }

    protected override addCoordinateAbility(properties: IAbilityPropsWithType<this>): void {
        return super.addCoordinateAbility(this.addZoneForSideToAbilityWithType(properties));
    }

    protected override addConstantAbility(properties: IConstantAbilityProps<this>) {
        properties.sourceZoneFilter = this.getAbilityZonesForSide(properties.sourceZoneFilter);
        return super.addConstantAbility(properties);
    }

    protected override addReplacementEffectAbility(properties: IReplacementEffectAbilityProps<this>) {
        properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        return super.addReplacementEffectAbility(properties);
    }

    protected override addTriggeredAbility(properties: ITriggeredAbilityProps<this>) {
        properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        return super.addTriggeredAbility(properties);
    }

    /** Generates the right zoneFilter property depending on which leader side we're setting up */
    private addZoneForSideToAbilityWithType<Properties extends IAbilityPropsWithType<this>>(properties: Properties) {
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
                this.exhausted = false;
                this.setCaptureZoneEnabled(true);
                break;

            case ZoneName.Base:
                this._deployed = false;
                this.setDamageEnabled(false);
                this.setActiveAttackEnabled(false);
                this.setUpgradesEnabled(false);
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
}
