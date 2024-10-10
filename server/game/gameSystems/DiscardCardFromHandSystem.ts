import { AbilityContext } from '../core/ability/AbilityContext';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardType, EventName, Location, WildcardCardType } from '../core/Constants';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDiscardCardFromHandProperties extends ICardTargetSystemProperties {
}

export class DiscardCardFromHandSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDiscardCardFromHandProperties> {
    public override readonly name = 'discardFromHand';
    public override readonly eventName = EventName.OnCardsDiscardedFromHand;
    public override readonly effectDescription = 'discard {0} from their hand';
    public override readonly costDescription = 'discarding {0} from their hand';
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    public eventHandler (event, additionalProperties = {}): void {
        event.card.owner.moveCard(event.card, Location.Discard);
        // TODO ADD TIMING
    }
}
