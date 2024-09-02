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
import Contract from '../utils/Contract';

const LeaderUnitCardParent = WithUnitProperties(WithCost(LeaderCard));

// TODO LEADERS: add custom defeat logic
export class LeaderUnitCard extends LeaderUnitCardParent {
    public override get type() {
        return this._isDeployed ? CardType.LeaderUnit : CardType.Leader;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        this.setupLeaderUnitSide = true;
        this.setupLeaderUnitSideAbilities();

        // TODO THIS PR: add check that abilities for leader unit side got added

        // leaders are always in a zone where they are allowed to be exhausted
        this.enableExhaust(true);

        this.addActionAbility({
            title: `Deploy ${this.name}`,
            limit: AbilityHelper.limit.perGame(1),
            condition: (context) => context.source.controller.resources.length >= context.source.cost,
            locationFilter: Location.Base,
            immediateEffect: AbilityHelper.immediateEffects.deploy({ deployArena: this.defaultArena })
        });
    }

    public override isUnit(): this is UnitCard {
        return this._isDeployed;
    }

    public override isLeaderUnit(): this is LeaderUnitCard {
        return this._isDeployed;
    }

    public override deploy() {
        if (!Contract.assertFalse(this._isDeployed, 'Attempting to deploy already deployed leader')) {
            return;
        }

        this._isDeployed = true;
        this.controller.moveCard(this, this.defaultArena);
    }

    /**
     * Create card abilities for the leader unit side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderUnitSideAbilities() {
    }

    protected override addActionAbility(properties: IActionAbilityProps<this>) {
        this.addAbilityLocationForSide(properties);
        super.addActionAbility(properties);
    }

    protected override addConstantAbility(properties: IConstantAbilityProps<this>): void {
        this.addAbilityLocationForSide(properties);
        super.addConstantAbility(properties);
    }

    protected override addReplacementEffectAbility(properties: IReplacementEffectAbilityProps): void {
        this.addAbilityLocationForSide(properties);
        super.addReplacementEffectAbility(properties);
    }

    protected override addTriggeredAbility(properties: ITriggeredAbilityProps): void {
        this.addAbilityLocationForSide(properties);
        super.addTriggeredAbility(properties);
    }

    private addAbilityLocationForSide(properties: { locationFilter?: LocationFilter | LocationFilter[] }) {
        const abilityLocation = this.setupLeaderUnitSide ? this.defaultArena : Location.Base;

        properties.locationFilter = properties.locationFilter
            ? Helpers.asArray(properties.locationFilter).concat([abilityLocation])
            : abilityLocation;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        switch (this.location) {
            case Location.GroundArena:
            case Location.SpaceArena:
                this._isDeployed = true;
                this.enableDamage(true);
                this.exhausted = false;
                break;

            case Location.Base:
                this._isDeployed = false;
                this.enableDamage(false);
                this.exhausted = true;
                break;
        }
    }
}
