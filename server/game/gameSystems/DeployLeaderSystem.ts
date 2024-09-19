import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EventName } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import Contract from '../core/utils/Contract';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDeployLeaderProperties extends ICardTargetSystemProperties {}

export class DeployLeaderSystem extends CardTargetSystem<IDeployLeaderProperties> {
    public override readonly name = 'deploy leader';
    public override readonly eventName = EventName.OnLeaderDeployed;
    public override readonly effectDescription = 'deploy {0}';

    protected override readonly targetTypeFilter = [CardType.Leader];

    public eventHandler(event): void {
        if (
            !Contract.assertTrue(event.card.isLeader())
        ) {
            return;
        }

        event.card.deploy();
    }

    public override canAffect(card: Card, context: AbilityContext): boolean {
        if (!card.isLeader() || card.deployed) {
            return false;
        }
        return super.canAffect(card, context);
    }
}
