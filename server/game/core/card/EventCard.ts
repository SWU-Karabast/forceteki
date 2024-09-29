import Player from '../Player';
import { WithCost } from './propertyMixins/Cost';
import { AbilityType, CardType, Location } from '../Constants';
import * as Contract from '../utils/Contract';
import { PlayableOrDeployableCard } from './baseClasses/PlayableOrDeployableCard';
import { IEventAbilityProps } from '../../Interfaces';
import { EventAbility } from '../ability/EventAbility';
import { PlayEventAction } from '../../actions/PlayEventAction';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import AbilityHelper from '../../AbilityHelper';

const EventCardParent = WithCost(WithStandardAbilitySetup(PlayableOrDeployableCard));

export class EventCard extends EventCardParent {
    private _eventAbility: EventAbility;

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Event);

        this.defaultActions.push(new PlayEventAction(this));

        Contract.assertNotNullLike(this._eventAbility, 'Event card\'s ability was not initialized');
    }

    public override isEvent(): this is EventCard {
        return true;
    }

    /** Ability of event card when played. Will be a "blank" ability with no effect if this card is disabled by an effect. */
    public getEventAbility(): EventAbility {
        return this.isBlank()
            ? new EventAbility(this._eventAbility.game, this._eventAbility.card, { title: 'No effect', printedAbility: false, immediateEffect: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true }) })
            : this._eventAbility;
    }

    protected override initializeForCurrentLocation(prevLocation: Location): void {
        super.initializeForCurrentLocation(prevLocation);

        // event cards can only be exhausted when resourced
        switch (this.location) {
            case Location.Resource:
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
}
