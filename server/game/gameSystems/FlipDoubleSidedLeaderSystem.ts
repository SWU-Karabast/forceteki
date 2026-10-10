import { GameStateChangeRequired } from '../core/Constants';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EventName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { Contract } from '../core/utils/Contract';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IFlipDoubleSidedLeaderProperties extends ICardTargetSystemProperties {}

export class FlipDoubleSidedLeaderSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IFlipDoubleSidedLeaderProperties> {
    public override readonly name = 'flip double-sided leader';
    public override readonly eventName = EventName.OnLeaderFlipped;
    public override readonly effectDescription = 'flip {0}';
    protected override readonly targetTypeFilter = [CardType.Leader];

    protected override eventHandlerInternal(event): void {
        Contract.assertTrue(event.card.isDoubleSidedLeader(), event.card.internalName);
        Contract.assertFalse(event.card.isDeployableLeader(), event.card.internalName);
        event.card.flipLeader();
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IFlipDoubleSidedLeaderProperties): boolean {
        if (!card.isDoubleSidedLeader()) {
            return false;
        }
        return super.canAffectInternal(card, context, properties, GameStateChangeRequired.None);
    }
}
