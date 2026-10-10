import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import { GameStateChangeRequired } from '../core/Constants';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DeployType } from '../core/Constants';
import { CardType, EventName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { Contract } from '../core/utils/Contract';
import { GameEvent } from '../core/event/GameEvent';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDeployLeaderProperties extends ICardTargetSystemProperties {}

export class DeployLeaderSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDeployLeaderProperties> {
    public override readonly name = 'deploy leader';
    public override readonly eventName = EventName.OnLeaderDeployed;
    public override readonly effectDescription = 'deploy {0}';

    protected override readonly targetTypeFilter = [CardType.Leader];

    protected override eventHandlerInternal(event): void {
        Contract.assertTrue(event.card.isDeployableLeader());

        event.card.deploy({ type: DeployType.LeaderUnit });
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IDeployLeaderProperties): boolean {
        if (!card.isLeader() || card.isDeployableLeader() && card.deployed) {
            return false;
        }
        return super.canAffectInternal(card, context, properties, GameStateChangeRequired.None);
    }

    protected override updateEvent(event, card: Card, context: TContext, properties: IDeployLeaderProperties, additionalProperties: Partial<IGameSystemInput<IDeployLeaderProperties>> = {}) {
        super.updateEvent(event, card, context, properties, additionalProperties);
        event.setContingentEventsGenerator(() => {
            const entersPlayEvent = new GameEvent(EventName.OnUnitEntersPlay, context, {
                player: context.player,
                card
            });

            return [entersPlayEvent];
        });
    }
}
