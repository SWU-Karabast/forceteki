import type { Player } from '../Player';
import type { Aspect, Trait } from '../Constants';
import { ZoneName } from '../Constants';
import type { IActionAbilityProps, IConstantAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import { WithLeaderProperties, type ILeaderCard } from './propertyMixins/LeaderProperties';
import { PlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';
import { WithAllAbilityTypes } from './propertyMixins/AllAbilityTypeRegistrations';
import type { ICardDataJson } from '../../../utils/cardData/CardDataInterfaces';

const DoubleSidedLeaderCardParent = WithLeaderProperties(WithAllAbilityTypes(PlayableOrDeployableCard));


export interface IDoubleSidedLeaderCard extends ILeaderCard {
    get onStartingSide(): boolean;
    flipLeader(): void;
}

export class DoubleSidedLeaderCard extends DoubleSidedLeaderCardParent implements IDoubleSidedLeaderCard {
    protected setupLeaderBackSide = false;

    public constructor(owner: Player, cardData: ICardDataJson) {
        super(owner, cardData);

        this.setupLeaderBackSide = true;
        this.setupLeaderBackSideAbilities(this);
    }

    protected override setupDefaultState() {
        super.setupDefaultState();
        this.state.onStartingSide = true;
    }

    public get onStartingSide() {
        return this.state.onStartingSide;
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

    protected override getPrintedTraits(): Set<Trait> {
        const traits = this.onStartingSide ? new Set(this.printedTraits) : new Set(this.backsidePrintedTraits);
        return traits;
    }

    /**
     * Create card abilities for the second leader side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderBackSideAbilities(sourceCard: this) {
    }

    public flipLeader() {
        this.state.onStartingSide = !this.state.onStartingSide;
    }

    public override initializeForStartZone(): void {
        super.initializeForStartZone();

        // leaders are always in a zone where they are allowed to be exhausted
        this.setExhaustEnabled(true);
        this.resolveAbilitiesForNewZone();
    }

    public override getSummary(activePlayer: Player): string {
        return { ...super.getSummary(activePlayer), onStartingSide: this.state.onStartingSide };
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

    protected override addTriggeredAbility(properties: ITriggeredAbilityProps<this>) {
        properties.zoneFilter = ZoneName.Base;
        return super.addTriggeredAbility(properties);
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        this.exhausted = false;
        super.initializeForCurrentZone(prevZone);
    }
}
