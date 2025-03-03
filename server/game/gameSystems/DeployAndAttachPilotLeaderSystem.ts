import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DeployType, EventName, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { GameEvent } from '../core/event/GameEvent';
import type { ILeaderUnitCard } from '../core/card/LeaderUnitCard';

export interface IDeployAndAttachLeaderPilotProperties extends ICardTargetSystemProperties {
    leaderPilotCard: ILeaderUnitCard;
}

export class DeployAndAttachPilotLeaderSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDeployAndAttachLeaderPilotProperties> {
    public override readonly name = 'deploy and attach pilot leader';
    public override readonly eventName = EventName.OnLeaderDeployed;
    public override readonly effectDescription = 'deploy {0} and attach it to {1}';

    protected override readonly targetTypeFilter = [WildcardCardType.NonLeaderUnit];

    public eventHandler(event): void {
        Contract.assertTrue(event.card.isUnit());
        Contract.assertTrue(event.card.canAttachPilot());
        Contract.assertTrue(event.leaderPilotCard.isDeployableLeader());

        Contract.assertNotNullLike(event.leaderPilotCard);
        event.leaderPilotCard.deploy(DeployType.LeaderUpgrade, event.card);
    }

    public override getEffectMessage(context: TContext, additionalProperties: any = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['deploy {0} and attach it to {1}', [properties.leaderPilotCard, properties.target]];
    }

    public override canAffect(card: Card, context: TContext): boolean {
        if (!card.isUnit() || !card.canAttachPilot()) {
            return false;
        }
        return super.canAffect(card, context);
    }

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        const properties = this.generatePropertiesFromContext(context);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.leaderPilotCard = properties.leaderPilotCard;
        event.deployType = DeployType.LeaderUpgrade;
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
