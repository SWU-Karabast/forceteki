import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DeployType } from '../core/Constants';
import { CardType, EventName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { GameEvent } from '../core/event/GameEvent';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDeployLeaderProperties extends ICardTargetSystemProperties {}

export class DeployLeaderSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDeployLeaderProperties> {
    public override readonly name = 'deploy leader';
    public override readonly eventName = EventName.OnLeaderDeployed;
    public override readonly effectDescription = 'deploy {0}';

    protected override readonly targetTypeFilter = [CardType.Leader];

    public eventHandler(event): void {
        Contract.assertTrue(event.card.isDeployableLeader());

        event.card.deploy({ type: DeployType.LeaderUnit });
    }

    public override canAffectInternal(card: Card, context: TContext): boolean {
        if (!card.isLeader() || card.isDeployableLeader() && card.deployed) {
            return false;
        }
        return super.canAffectInternal(card, context);
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<IDeployLeaderProperties> = {}) {
        super.updateEvent(event, card, context, additionalProperties);
        event.setContingentEventsGenerator(() => {
            const entersPlayEvent = new GameEvent(EventName.OnUnitEntersPlay, context, {
                player: context.player,
                card
            });

            return [entersPlayEvent];
        });
    }
}
