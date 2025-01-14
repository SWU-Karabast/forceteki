import type Player from '../Player';
import type { ILeaderCardState } from './LeaderCard';
import { LeaderCard } from './LeaderCard';
import type { ZoneFilter } from '../Constants';
import { CardType, ZoneName } from '../Constants';
import { WithCost } from './propertyMixins/Cost';
import { WithUnitProperties } from './propertyMixins/UnitProperties';
import type { UnitCard } from './CardTypes';
import * as EnumHelpers from '../utils/EnumHelpers';
import type { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import * as Helpers from '../utils/Helpers';
import * as Contract from '../utils/Contract';
import { EpicActionLimit } from '../ability/AbilityLimit';
import { DeployLeaderSystem } from '../../gameSystems/DeployLeaderSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILeaderUnitCardState extends ILeaderCardState { }

const LeaderUnitCardParent = WithUnitProperties(WithCost(LeaderCard));

class LeaderUnitCardInternal extends LeaderUnitCardParent {
    public override get type() {
        return this.state.deployed ? CardType.LeaderUnit : CardType.Leader;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        this.state.setupLeaderUnitSide = true;
        this.setupLeaderUnitSideAbilities(this);

        // add deploy leader action
        this.addActionAbility({
            title: `Deploy ${this.title}`,
            limit: new EpicActionLimit(),
            condition: (context) => context.source.controller.resources.length >= context.source.cost,
            zoneFilter: ZoneName.Base,
            immediateEffect: new DeployLeaderSystem({})
        });
    }

    public override isUnit(): this is UnitCard {
        return this.state.deployed;
    }

    public override isLeaderUnit(): this is LeaderUnitCard {
        return this.state.deployed;
    }

    public override initializeForStartZone(): void {
        super.initializeForStartZone();

        // leaders are always in a zone where they are allowed to be exhausted
        this.setExhaustEnabled(true);
        this.resolveAbilitiesForNewZone();
    }

    /** Deploy the leader to the arena. Handles the move operation and state changes. */
    public override deploy() {
        Contract.assertFalse(this.state.deployed, `Attempting to deploy already deployed leader ${this.internalName}`);

        this.state.deployed = true;
        this.moveTo(this.defaultArena);
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

    protected override addActionAbility(properties: IActionAbilityProps<this>) {
        properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        super.addActionAbility(properties);
    }

    protected override addConstantAbility(properties: IConstantAbilityProps<this>): void {
        properties.sourceZoneFilter = this.getAbilityZonesForSide(properties.sourceZoneFilter);
        super.addConstantAbility(properties);
    }

    protected override addReplacementEffectAbility(properties: IReplacementEffectAbilityProps<this>): void {
        properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        super.addReplacementEffectAbility(properties);
    }

    protected override addTriggeredAbility(properties: ITriggeredAbilityProps<this>): void {
        properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        super.addTriggeredAbility(properties);
    }

    /** Generates the right zoneFilter property depending on which leader side we're setting up */
    private getAbilityZonesForSide(propertyZone: ZoneFilter | ZoneFilter[]) {
        const abilityZone = this.state.setupLeaderUnitSide ? this.defaultArena : ZoneName.Base;

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
                this.exhausted = false;
                this.setCaptureZoneEnabled(true);
                break;

            case ZoneName.Base:
                this.state.deployed = false;
                this.setDamageEnabled(false);
                this.setActiveAttackEnabled(false);
                this.setUpgradesEnabled(false);
                this.exhausted = prevZone ? EnumHelpers.isArena(prevZone) : false;
                this.setCaptureZoneEnabled(false);
                break;
        }
    }
}

export class LeaderUnitCard extends LeaderUnitCardInternal {
    protected override state: never;
}