import type Player from '../Player';
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
import type { ActionAbility } from '../ability/ActionAbility';

const LeaderUnitCardParent = WithUnitProperties(WithCost(LeaderCard));

export class LeaderUnitCard extends LeaderUnitCardParent {
    private readonly epicActionAbility: ActionAbility;

    public override get type() {
        return this._deployed ? CardType.LeaderUnit : CardType.Leader;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        this.setupLeaderUnitSide = true;
        this.setupLeaderUnitSideAbilities(this);

        // add deploy leader action
        this.epicActionAbility = this.addActionAbility({
            title: `Deploy ${this.title}`,
            limit: new EpicActionLimit(),
            condition: (context) => context.source.controller.resources.length >= context.source.cost,
            zoneFilter: ZoneName.Base,
            immediateEffect: new DeployLeaderSystem({})
        });
    }

    public override isUnit(): this is UnitCard {
        return this._deployed;
    }

    public override isLeaderUnit(): this is LeaderUnitCard {
        return this._deployed;
    }

    public override initializeForStartZone(): void {
        super.initializeForStartZone();

        // leaders are always in a zone where they are allowed to be exhausted
        this.setExhaustEnabled(true);
        this.resolveAbilitiesForNewZone();
    }

    /** Deploy the leader to the arena. Handles the move operation and state changes. */
    public override deploy() {
        Contract.assertFalse(this._deployed, `Attempting to deploy already deployed leader ${this.internalName}`);

        this._deployed = true;
        this.moveTo(this.defaultArena);
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

    protected override addActionAbility(properties: IActionAbilityProps<this>) {
        properties.zoneFilter = this.getAbilityZonesForSide(properties.zoneFilter);
        return super.addActionAbility(properties);
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
            epicActionSpent: this.epicActionAbility.limit.isAtMax(this.owner)
        };
    }
}
