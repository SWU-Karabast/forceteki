import type Player from '../Player';
import type { ILeaderCard } from './LeaderCard';
import { LeaderCard } from './LeaderCard';
import type { Aspect } from '../Constants';
import { ZoneName } from '../Constants';
import type { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';

export interface IDoubleSidedLeaderCard extends ILeaderCard {
    get onStartingSide(): boolean;
    flipLeader(): void;
}

export class DoubleSidedLeaderCard extends LeaderCard implements IDoubleSidedLeaderCard {
    protected _onStartingSide = true;
    protected setupLeaderBackSide = false;

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);

        this.setupLeaderBackSide = true;
        this.setupLeaderBackSideAbilities(this);
    }

    public get onStartingSide() {
        return this._onStartingSide;
    }

    public override get aspects(): Aspect[] {
        return this.onStartingSide ? this._aspects : this._backSideAspects;
    }

    public override get title(): string {
        return this.onStartingSide ? this._title : this._backSideTitle;
    }

    public override isDoubleSidedLeader(): this is IDoubleSidedLeaderCard {
        return true;
    }

    /**
     * Create card abilities for the second leader side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderBackSideAbilities(sourceCard: this) {
    }

    public flipLeader() {
        this._onStartingSide = !this._onStartingSide;
    }

    public override initializeForStartZone(): void {
        super.initializeForStartZone();

        // leaders are always in a zone where they are allowed to be exhausted
        this.setExhaustEnabled(true);
        this.resolveAbilitiesForNewZone();
    }

    public override getSummary(activePlayer: Player): string {
        return { ...super.getSummary(activePlayer), onStartingSide: this._onStartingSide };
    }

    protected override addActionAbility(properties: IActionAbilityProps<this>) {
        properties.zoneFilter = ZoneName.Base;
        if (this.setupLeaderBackSide) {
            properties.condition = () => this.onStartingSide === false;
        } else {
            properties.condition = () => this.onStartingSide === true;
        }
        return super.addActionAbility(properties);
    }

    protected override addConstantAbility(properties: IConstantAbilityProps<this>) {
        properties.sourceZoneFilter = ZoneName.Base;
        properties.condition = () => !this.onStartingSide;
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