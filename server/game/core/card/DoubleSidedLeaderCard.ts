import type Player from '../Player';
import { LeaderCard } from './LeaderCard';
import type { ZoneFilter } from '../Constants';
import { CardType, ZoneName } from '../Constants';
import type { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import * as Helpers from '../utils/Helpers';

export class DoubleSidedLeaderCard extends LeaderCard {
    protected _onStartingSide = false;

    public get onStartingSide() {
        return this._onStartingSide;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
    }

    public override get type(): CardType {
        return CardType.DoubleSidedLeader;
    }

    public override isDoubleSidedLeader(): this is DoubleSidedLeaderCard {
        return true;
    }

    /**
     * Create card abilities for the second leader side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderBackSideAbilities(sourceCard: this) {
    }

    protected flipLeader() {
        this._onStartingSide = !this._onStartingSide;
    }

    public override initializeForStartZone(): void {
        super.initializeForStartZone();

        // leaders are always in a zone where they are allowed to be exhausted
        this.setExhaustEnabled(true);
        this.resolveAbilitiesForNewZone();
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
        const abilityZone = ZoneName.Base;

        return propertyZone
            ? Helpers.asArray(propertyZone).concat([abilityZone])
            : abilityZone;
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        super.initializeForCurrentZone(prevZone);
    }

    public override getSummary(activePlayer: Player) {
        return {
            ...super.getSummary(activePlayer)
        };
    }
}