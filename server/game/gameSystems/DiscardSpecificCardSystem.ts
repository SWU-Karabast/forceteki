import { GameStateChangeRequired } from '../core/Constants';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, ZoneName } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDiscardSpecificCardProperties extends ICardTargetSystemProperties {}

export class DiscardSpecificCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDiscardSpecificCardProperties> {
    public override readonly name = 'discardSpecificCard';
    public override readonly costDescription = 'discarding {0}';
    public override readonly effectDescription = 'discard {0}';
    public override readonly eventName = EventName.OnCardDiscarded;

    protected override eventHandlerInternal(event): void {
        event.card.moveTo(ZoneName.Discard);
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IDiscardSpecificCardProperties): boolean {
        return card.zoneName !== ZoneName.Discard && super.canAffectInternal(card, context, properties, GameStateChangeRequired.None);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, properties: IDiscardSpecificCardProperties): void {
        event.discardedFromZone = card.zoneName;
        super.addPropertiesToEvent(event, card, context, properties);
    }
}
