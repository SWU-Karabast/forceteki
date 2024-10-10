import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
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
        Contract.assertTrue(event.card.isLeader());

        const deployedEvent = new GameEvent(this.eventName, {
            player: event.context.source.controller,
            card: event.card,
            context: event.context
        });

        event.context.game.addMessage('{0} plays {1}', event.context.player, event.context.source);
        event.card.deploy();
        event.context.game.openEventWindow(deployedEvent, true);
    }

    public override canAffect(card: Card, context: TContext): boolean {
        if (!card.isLeader() || card.deployed) {
            return false;
        }
        return super.canAffect(card, context);
    }
}
