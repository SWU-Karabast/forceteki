import Player from '../Player';
import { LeaderCard } from './LeaderCard';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { CardType, Location, LocationFilter } from '../Constants';
import { WithCost } from './propertyMixins/Cost';
import { WithUnitProperties } from './propertyMixins/UnitProperties';
import type { UnitCard } from './CardTypes';
import * as EnumHelpers from '../utils/EnumHelpers';
import { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import * as Helpers from '../utils/Helpers';
import AbilityHelper from '../../AbilityHelper';
import * as Contract from '../utils/Contract';

const LeaderUnitCardParent = WithUnitProperties(WithCost(LeaderCard));

export class LeaderUnitCard extends LeaderUnitCardParent {
    public override get type() {
        return this._deployed ? CardType.LeaderUnit : CardType.Leader;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        this.setupLeaderUnitSide = true;
        this.setupLeaderUnitSideAbilities();

        // leaders are always in a zone where they are allowed to be exhausted
        this.enableExhaust(true);

        // add deploy leader action
        this.addActionAbility({
            title: `Deploy ${this.name}`,
            limit: AbilityHelper.limit.epicAction(),
            condition: (context) => context.source.controller.resources.length >= context.source.cost,
            locationFilter: Location.Base,
            immediateEffect: AbilityHelper.immediateEffects.deploy()
        });
    }

    public override isUnit(): this is UnitCard {
        return this._deployed;
    }

    public override isLeaderUnit(): this is LeaderUnitCard {
        return this._deployed;
    }

    /** Deploy the leader to the arena. Handles the move operation and state changes. */
    public override deploy() {
        Contract.assertFalse(this._deployed, `Attempting to deploy already deployed leader ${this.internalName}`);

        this._deployed = true;
        this.controller.moveCard(this, this.defaultArena);
    }

    /** Return the leader from the arena to the base zone. Handles the move operation and state changes. */
    public undeploy() {
        Contract.assertTrue(this._deployed, `Attempting to un-deploy leader ${this.internalName} while it is not deployed`);

        this._deployed = false;
        this.controller.moveCard(this, Location.Base);
    }

    /**
     * Create card abilities for the leader unit side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderUnitSideAbilities() {
    }

    protected override addActionAbility(properties: IActionAbilityProps<this>) {
        properties.locationFilter = this.getAbilityLocationsForSide(properties.locationFilter);
        super.addActionAbility(properties);
    }

    protected override addConstantAbility(properties: IConstantAbilityProps<this>): void {
        properties.sourceLocationFilter = this.getAbilityLocationsForSide(properties.sourceLocationFilter);
        super.addConstantAbility(properties);
    }

    protected override addReplacementEffectAbility(properties: IReplacementEffectAbilityProps<this>): void {
        properties.locationFilter = this.getAbilityLocationsForSide(properties.locationFilter);
        super.addReplacementEffectAbility(properties);
    }

    protected override addTriggeredAbility(properties: ITriggeredAbilityProps<this>): void {
        properties.locationFilter = this.getAbilityLocationsForSide(properties.locationFilter);
        super.addTriggeredAbility(properties);
    }

    /** Generates the right locationFilter property depending on which leader side we're setting up */
    private getAbilityLocationsForSide(propertyLocation: LocationFilter | LocationFilter[]) {
        const abilityLocation = this.setupLeaderUnitSide ? this.defaultArena : Location.Base;

        return propertyLocation
            ? Helpers.asArray(propertyLocation).concat([abilityLocation])
            : abilityLocation;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        switch (this.location) {
            case Location.GroundArena:
            case Location.SpaceArena:
                this._deployed = true;
                this.enableDamage(true);
                this.enableActiveAttack(true);
                this.enableUpgrades(true);
                this.exhausted = false;
                break;

            case Location.Base:
                this._deployed = false;
                this.enableDamage(false);
                this.enableActiveAttack(false);
                this.enableUpgrades(false);
                this.exhausted = EnumHelpers.isArena(prevLocation);
                break;
        }
    }
}
