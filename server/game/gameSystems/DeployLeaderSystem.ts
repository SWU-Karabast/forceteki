import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { Arena, CardType, EventName } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import Contract from '../core/utils/Contract';
import * as EnumHelpers from '../core/utils/EnumHelpers';

export interface IDeployLeaderProperties extends ICardTargetSystemProperties {
    deployArena: Arena;
}

export class DeployLeaderSystem extends CardTargetSystem<IDeployLeaderProperties> {
    public override readonly name = 'deploy leader';
    public override readonly eventName = EventName.OnLeaderDeployed;
    public override readonly effectDescription = 'deploy {0}';

    protected override readonly targetTypeFilter = [CardType.Leader];

    public eventHandler(event): void {
        if (
            !Contract.assertTrue(event.card.isLeader()) ||
            !Contract.assertFalse(event.card.isDeployed) ||
            !Contract.assertTrue(EnumHelpers.isArena(event.deployArena))
        ) {
            return;
        }

        event.player.moveCard(event.card, event.deployArena);
    }

    public override canAffect(card: Card, context: AbilityContext): boolean {
        if (!card.isLeader() || card.isDeployed) {
            return false;
        }
        return super.canAffect(card, context);
    }

    public override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        const { deployArena } = this.generatePropertiesFromContext(context, additionalProperties) as IDeployLeaderProperties;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.deployArena = deployArena;
    }
}
