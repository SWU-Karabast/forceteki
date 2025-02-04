import type Player from '../Player';
import { LeaderCard } from './LeaderCard';
import { CardType, ZoneName } from '../Constants';
import type { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';

export class DoubleSidedLeaderCard extends LeaderCard {
    protected _onStartingSide = false;

    public get onStartingSide() {
        return this._onStartingSide;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        // this.setupLeaderBackSideAbilities(this);
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
        properties.zoneFilter = ZoneName.Base;
        return super.addActionAbility(properties);
    }

    protected override addConstantAbility(properties: IConstantAbilityProps<this>) {
        properties.sourceZoneFilter = ZoneName.Base;
        return super.addConstantAbility(properties);
    }

    protected override addReplacementEffectAbility(properties: IReplacementEffectAbilityProps<this>) {
        properties.zoneFilter = ZoneName.Base;
        return super.addReplacementEffectAbility(properties);
    }

    protected override addTriggeredAbility(properties: ITriggeredAbilityProps<this>) {
        properties.zoneFilter = ZoneName.Base;
        return super.addTriggeredAbility(properties);
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        this.exhausted = false;
        super.initializeForCurrentZone(prevZone);
    }
}