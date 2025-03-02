import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { DeployType } from '../core/Constants';
import { CardType, EventName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { GameEvent } from '../core/event/GameEvent';

export interface IDeployLeaderProperties extends ICardTargetSystemProperties {
    deployType: DeployType;
}

export class DeployLeaderSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDeployLeaderProperties> {
    public override readonly name = 'deploy leader';
    public override readonly eventName = EventName.OnLeaderDeployed;
    public override readonly effectDescription = 'deploy {0}';

    protected override readonly targetTypeFilter = [CardType.Leader];

    public eventHandler(event): void {
        Contract.assertTrue(event.card.isDeployableLeader());
        event.card.deploy();
    }

    public override getEffectMessage(context: TContext, additionalProperties: any = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['deploy {0}', [properties.target]];
    }

    public override canAffect(card: Card, context: TContext): boolean {
        if (!card.isLeader() || card.isDeployableLeader() && card.deployed) {
            return false;
        }
        return super.canAffect(card, context);
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: any = {}) {
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
