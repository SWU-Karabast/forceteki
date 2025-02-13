import type Player from '../Player';
import { WithCost } from './propertyMixins/Cost';
import { CardType, ZoneName } from '../Constants';
import * as Contract from '../utils/Contract';
import type { IDecreaseCostAbilityProps, IPlayableCard, IPlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';
import { PlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';
import type { IEventAbilityProps } from '../../Interfaces';
import { EventAbility } from '../ability/EventAbility';
import { PlayEventAction } from '../../actions/PlayEventAction';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import type { IPlayCardActionProperties } from '../ability/PlayCardAction';
import { NoActionSystem } from '../../gameSystems/NoActionSystem';

const EventCardParent = WithCost(WithStandardAbilitySetup(PlayableOrDeployableCard));

export interface IEventCard extends IPlayableOrDeployableCard {
    getEventAbility(): EventAbility;
}

export class EventCard extends EventCardParent {
    private _eventAbility: EventAbility;

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Event);

        Contract.assertFalse(this.hasImplementationFile && !this._eventAbility, 'Event card\'s ability was not initialized');

        // currently the only constant abilities an event card can have are those that reduce cost, which are always active regardless of zone
        for (const constantAbility of this.constantAbilities) {
            constantAbility.registeredEffects = this.addEffectToEngine(constantAbility);
        }
    }

    public override isEvent(): this is IEventCard {
        return true;
    }

    public override buildPlayCardAction(properties: IPlayCardActionProperties) {
        return new PlayEventAction(this.game, this, properties);
    }

    public override isPlayable(): this is IPlayableCard {
        return true;
    }

    /** Ability of event card when played. Will be a "blank" ability with no effect if this card is disabled by an effect. */
    public getEventAbility(): EventAbility {
        return this.isBlank()
            ? new EventAbility(this._eventAbility.game, this._eventAbility.card, {
                title: 'No effect',
                printedAbility: false,
                immediateEffect: new NoActionSystem({ hasLegalTarget: true })
            })
            : this._eventAbility;
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

    protected setEventAbility(properties: IEventAbilityProps) {
        properties.cardName = this.title;
        this._eventAbility = new EventAbility(this.game, this, properties);
    }


    /** Add a constant ability on the card that decreases its cost under the given condition */
    protected addDecreaseCostAbility(properties: IDecreaseCostAbilityProps<this>): void {
        this.constantAbilities.push(this.createConstantAbility(this.generateDecreaseCostAbilityProps(properties)));
    }
}
