import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EventName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IFlipDoubleSidedLeaderProperties extends ICardTargetSystemProperties {}

export class FlipDoubleSidedLeaderSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IFlipDoubleSidedLeaderProperties> {
    public override readonly name = 'flip double-sided leader';
    public override readonly eventName = EventName.OnLeaderFlipped;
    public override readonly effectDescription = 'deploy {0}';

    protected override readonly targetTypeFilter = [CardType.Leader];

    public eventHandler(event): void {
        Contract.assertTrue(event.card.isDoubleSidedLeader(), event.card.internalName);
        Contract.assertFalse(event.card.isDeployableLeader(), event.card.internalName);
        event.card.flipLeader();
    }

    public override getEffectMessage(context: TContext, additionalProperties: any = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['deploy {0}', [properties.target]];
    }

    public override canAffect(card: Card, context: TContext): boolean {
        if (!card.isDoubleSidedLeader()) {
            return false;
        }
        return super.canAffect(card, context);
    }
}
