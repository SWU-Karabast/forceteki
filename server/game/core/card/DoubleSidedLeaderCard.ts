import type { Player } from '../Player';
import type { Aspect, Trait } from '../Constants';
import { ZoneName } from '../Constants';
import type { IActionAbilityProps, IConstantAbilityProps, IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import { WithLeaderProperties, type ILeaderCard } from './propertyMixins/LeaderProperties';
import { PlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';
import { WithAllAbilityTypes } from './propertyMixins/AllAbilityTypeRegistrations';
import type { ICardDataJson } from '../../../utils/cardData/CardDataInterfaces';
import type { IDoubleSidedLeaderAbilityRegistrar, ILeaderAbilityRegistrar } from './AbilityRegistrationInterfaces';
import type { ActionAbility } from '../ability/ActionAbility';
import type { Card } from './Card';
import type { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import type TriggeredAbility from '../ability/TriggeredAbility';
import type ReplacementEffectAbility from '../ability/ReplacementEffectAbility';
import type { IAbilityHelper } from '../../AbilityHelper';

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
        this.setupLeaderBackSideAbilities(this.getAbilityRegistrar(), this.game.abilityHelper);
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

    protected override getAbilityRegistrar(): IDoubleSidedLeaderAbilityRegistrar {
        return super.getAbilityRegistrar() as ILeaderAbilityRegistrar<DoubleSidedLeaderCard>;
    }

    protected override callSetupLeaderWithRegistrar() {
        this.setupLeaderSideAbilities(this.getAbilityRegistrar(), this.game.abilityHelper);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override setupLeaderSideAbilities(registrar: ILeaderAbilityRegistrar<IDoubleSidedLeaderCard>, AbilityHelper: IAbilityHelper) {}

    /**
     * Create card abilities for the second leader side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderBackSideAbilities(registrar: IDoubleSidedLeaderAbilityRegistrar, AbilityHelper: IAbilityHelper) {
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

    public override createActionAbility<TSource extends Card = this>(properties: IActionAbilityProps<TSource>): ActionAbility {
        return super.createActionAbility({
            ...properties,
            zoneFilter: ZoneName.Base,
            condition: this.setupLeaderBackSide ? () => !this.onStartingSide : () => this.onStartingSide,
        });
    }

    public override createConstantAbility<TSource extends Card = this>(properties: IConstantAbilityProps<TSource>): IConstantAbility {
        return super.createConstantAbility({
            ...properties,
            sourceZoneFilter: ZoneName.Base,
            condition: this.setupLeaderBackSide ? () => !this.onStartingSide : () => this.onStartingSide,
        });
    }

    protected override createTriggeredAbility<TSource extends Card = this>(properties: ITriggeredAbilityProps<TSource>): TriggeredAbility {
        return super.createTriggeredAbility({
            ...properties,
            zoneFilter: ZoneName.Base,
        });
    }

    public override createReplacementEffectAbility<TSource extends Card = this>(properties: IReplacementEffectAbilityProps<TSource>): ReplacementEffectAbility {
        return super.createReplacementEffectAbility({
            ...properties,
            zoneFilter: ZoneName.Base,
        });
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        this.exhausted = false;
        super.initializeForCurrentZone(prevZone);
    }
}
