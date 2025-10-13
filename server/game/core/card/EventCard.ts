import type { Player } from '../Player';
import type { ICardWithCostProperty } from './propertyMixins/Cost';
import { WithCost } from './propertyMixins/Cost';
import type { MoveZoneDestination } from '../Constants';
import { AbilityRestriction, CardType, EffectName, WildcardZoneName, ZoneName } from '../Constants';
import * as Contract from '../utils/Contract';
import type { IDecreaseCostAbilityProps, IPlayableCard, IPlayableOrDeployableCard, IPlayableOrDeployableCardState } from './baseClasses/PlayableOrDeployableCard';
import { PlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';
import type { IEventAbilityProps, IPlayRestrictionAbilityProps } from '../../Interfaces';
import { EventAbility } from '../ability/EventAbility';
import { PlayEventAction } from '../../actions/PlayEventAction';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import type { IPlayCardActionProperties } from '../ability/PlayCardAction';
import { NoActionSystem } from '../../gameSystems/NoActionSystem';
import type { ICardCanChangeControllers } from './CardInterfaces';
import type { InitializeCardStateOption } from './Card';
import type { ICardDataJson } from '../../../utils/cardData/CardDataInterfaces';
import type { IBasicAbilityRegistrar, IEventAbilityRegistrar } from './AbilityRegistrationInterfaces';
import type { GameObjectRef } from '../GameObjectBase';
import type { IAbilityHelper } from '../../AbilityHelper';
import type { ICardWithTriggeredAbilities } from './propertyMixins/TriggeredAbilityRegistration';
import { WithTriggeredAbilities } from './propertyMixins/TriggeredAbilityRegistration';

// STATE TODO: This needs the eventAbility to be converted to state.
const EventCardParent = WithCost(WithTriggeredAbilities(WithStandardAbilitySetup(PlayableOrDeployableCard<IEventCardState>)));

export interface IEventCardState extends IPlayableOrDeployableCardState {
    eventAbility: GameObjectRef<EventAbility>;
}

export interface IEventCard extends IPlayableOrDeployableCard, ICardCanChangeControllers, ICardWithCostProperty, ICardWithTriggeredAbilities<EventCard> {
    getEventAbility(): EventAbility;
}

export class EventCard extends EventCardParent implements IEventCard {
    private get eventAbility(): EventAbility {
        return this.game.getFromRef(this.state.eventAbility);
    }

    public constructor(owner: Player, cardData: ICardDataJson) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Event);

        Contract.assertFalse(this.hasImplementationFile && !this.state.eventAbility, 'Event card\'s ability was not initialized');

        // currently the only constant abilities an event card can have are those that reduce cost, which are always active regardless of zone
        for (const constantAbility of this.constantAbilities) {
            constantAbility.registeredEffects = this.addEffectToEngine(constantAbility);
        }
    }

    public override isEvent(): this is IEventCard {
        return true;
    }

    public override buildPlayCardAction(properties: IPlayCardActionProperties) {
        return this.game.gameObjectManager.createWithoutRefsUnsafe(() => new PlayEventAction(this.game, this, properties));
    }

    public override canChangeController(): this is ICardCanChangeControllers {
        return true;
    }

    public override isPlayable(): this is IPlayableCard {
        return true;
    }

    /** Ability of event card when played. Will be a "blank" ability with no effect if this card is disabled by an effect. */
    public getEventAbility(): EventAbility {
        if (this.isBlank()) {
            const blankSource = this.getOngoingEffectSources(EffectName.BlankCard);
            return new EventAbility(this.game, this, {
                title: 'No effect',
                printedAbility: false,
                effect: 'do nothing due to an ongoing effect of {1}',
                effectArgs: [blankSource],
                immediateEffect: new NoActionSystem({ hasLegalTarget: true })
            });
        } else if (!this.hasImplementationFile) {
            return new EventAbility(this.game, this, {
                title: 'Unimplemented event card ability',
                printedAbility: false,
                effect: 'do nothing because the card is not implemented yet',
                immediateEffect: new NoActionSystem({ hasLegalTarget: true })
            });
        }

        return this.eventAbility;
    }

    public override moveTo(targetZoneName: MoveZoneDestination, initializeCardState?: InitializeCardStateOption): void {
        if (this.zoneName === ZoneName.Discard && targetZoneName === ZoneName.Discard) {
            this.removeLastingEffects();
        }
        super.moveTo(targetZoneName, initializeCardState);
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        super.initializeForCurrentZone(prevZone);

        // event cards can only be exhausted when resourced
        switch (this.zoneName) {
            case ZoneName.Resource:
                this.setExhaustEnabled(true);
                break;

            default:
                this.setExhaustEnabled(false);
                break;
        }
    }

    protected override getAbilityRegistrar(): IEventAbilityRegistrar {
        return {
            ...super.getAbilityRegistrar() as IBasicAbilityRegistrar<EventCard>,
            setEventAbility: (properties: IEventAbilityProps) => this.setEventAbility(properties),
            addDecreaseCostAbility: (properties: IDecreaseCostAbilityProps<EventCard>) => this.addDecreaseCostAbility(properties),
            addPlayRestrictionAbility: (properties: IPlayRestrictionAbilityProps) => this.addPlayRestrictionAbility(properties),
        };
    }

    protected override callSetupWithRegistrar() {
        this.setupCardAbilities(this.getAbilityRegistrar(), this.game.abilityHelper);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) { }

    private setEventAbility(properties: IEventAbilityProps) {
        properties.cardName = this.title;
        this.state.eventAbility = new EventAbility(this.game, this, properties).getRef();
    }

    /** Add a constant ability on the card that decreases its cost under the given condition */
    private addDecreaseCostAbility(properties: IDecreaseCostAbilityProps<EventCard>): void {
        this.state.constantAbilities.push(this.createConstantAbility(this.generateDecreaseCostAbilityProps(properties)).getRef());
    }

    private addPlayRestrictionAbility(properties: IPlayRestrictionAbilityProps) {
        const ability = this.createConstantAbility({
            title: properties.title,
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: this.game.abilityHelper.ongoingEffects.cardCannot({
                cannot: AbilityRestriction.Play,
                restrictedActionCondition: properties.restrictedActionCondition,
            }),
        });

        ability.registeredEffects = this.addEffectToEngine(ability);
        this.state.constantAbilities.push(ability.getRef());
    }
}