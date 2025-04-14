import type { Player } from '../Player';
import type { ZoneFilter } from '../Constants';
import { CardType, DeployType, PlayType, RelativePlayer, Trait, WildcardCardType } from '../Constants';
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

/** Represents a deployable leader in a deployed state (i.e., is also a unit) */
export interface ILeaderUnitCard extends ILeaderCard, IUnitCard {}

/** Represents a deployable leader in an undeployed state */
export interface IDeployableLeaderCard extends ILeaderUnitCard {
    get deployed(): boolean;
    deploy(deployProps: { type: DeployType.LeaderUnit } | { type: DeployType.LeaderUpgrade; parentCard: IUnitCard }): void;
    undeploy(): void;
}

export class LeaderUnitCardInternal extends LeaderUnitCardParent implements IDeployableLeaderCard {
    protected setupLeaderUnitSide;
    protected deployEpicActionLimit: EpicActionLimit;
    protected deployEpicActions: ActionAbility[];

    public get deployed() {
        return this.state.deployed;
    }

    public override getType(): CardType {
        if (this.canBeUpgrade && this.isAttached()) {
            return CardType.LeaderUpgrade;
        }
        return this.state.deployed ? CardType.LeaderUnit : CardType.Leader;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        // add deploy leader action
        this.deployEpicActions.push(this.addActionAbility({
            limit: this.deployEpicActionLimit,
            ...this.deployActionAbilityProps(),
            title: `Deploy ${this.title}`,
            condition: (context) => context.player.resources.length >= context.source.cost,
            zoneFilter: ZoneName.Base,
            immediateEffect: new DeployLeaderSystem({})
        }));

        this.setupLeaderUnitSide = true;
        this.setupLeaderUnitSideAbilities(this);
        this.validateCardAbilities(this.triggeredAbilities, cardData.deployBox);
    }

    protected override setupDefaultState() {
        super.setupDefaultState();
        this.state.deployed = false;
    }

    protected deployActionAbilityProps(): Omit<IActionAbilityProps<this>, 'title' | 'condition' | 'zoneFilter' | 'immediateEffect'> {
        return {};
    }

    protected override initializeStateForAbilitySetup() {
        super.initializeStateForAbilitySetup();
        this.deployEpicActions = [];
        this.deployEpicActionLimit = new EpicActionLimit();
    }

    public override isUnit(): this is IUnitCard {
        return this.state.deployed && !this.isAttached();
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
        Contract.assertFalse(this.state.deployed, `Attempting to deploy already deployed leader ${this.internalName}`);

        this.state.deployed = true;

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
        Contract.assertTrue(this.state.deployed, `Attempting to un-deploy leader ${this.internalName} while it is not deployed`);

        this.state.deployed = false;
        this.moveTo(ZoneName.Base);
    }

    /**
     * Create card abilities for the leader unit side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderUnitSideAbilities(sourceCard: this) {
    }

    protected addPilotDeploy(makeAttachedUnitALeader: boolean = true) {
        Contract.assertNotNullLike(this.printedUpgradeHp, `Leader ${this.title} is missing upgrade HP.`);
        Contract.assertNotNullLike(this.printedUpgradePower, `Leader ${this.title} is missing upgrade power.`);

        if (makeAttachedUnitALeader) {
            this.addPilotingConstantAbilityTargetingAttached({
                title: 'Attached unit is a Leader',
                ongoingEffect: AbilityHelper.ongoingEffects.isLeader()
            });
        }

        this.deployEpicActions.push(this.addActionAbility({
            title: `Deploy ${this.title} as a Pilot`,
            limit: this.deployEpicActionLimit,
            condition: (context) => context.player.resources.length >= context.source.cost,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && card.canAttachPilot(context.source, PlayType.Piloting),
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
                this.state.deployed = true;
                this.setDamageEnabled(true);
                this.setActiveAttackEnabled(true);
                this.setUpgradesEnabled(true);
                this.setExhaustEnabled(true);
                this.exhausted = false;
                this.setCaptureZoneEnabled(true);
                break;

            case ZoneName.Base:
                this.state.deployed = false;
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

export class LeaderUnitCard extends LeaderUnitCardInternal {
    protected override state: never;
}