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

    protected override readonly targetTypeFilter = [WildcardCardType.NonLeaderUnit];

    public eventHandler(event): void {
        Contract.assertNotNullLike(event.leaderAttachTarget);
        Contract.assertEqual(DeployType.LeaderUpgrade, event.type);
        Contract.assertTrue(event.leaderAttachTarget.isUnit());
        Contract.assertTrue(event.leaderAttachTarget.canAttachPilot(event.card));
        Contract.assertTrue(event.card.isDeployableLeader());

        event.card.deploy({
            type: DeployType.LeaderUpgrade,
            parentCard: event.leaderAttachTarget
        });
    }

    public override getEffectMessage(context: TContext, additionalProperties: Partial<IDeployAndAttachLeaderPilotProperties> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['deploy {0} as a pilot upgrade on {1}', [properties.leaderPilotCard, this.getTargetMessage(properties.target, context)]];
    }

    public override canAffectInternal(card: Card, context: TContext): boolean {
        const properties = this.generatePropertiesFromContext(context);

        if (!card.isUnit() || !card.canAttachPilot(properties.leaderPilotCard)) {
            return false;
        }

        return super.canAffectInternal(card, context);
    }

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<IDeployAndAttachLeaderPilotProperties>): void {
        const properties = this.generatePropertiesFromContext(context);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.card = properties.leaderPilotCard;
        event.leaderAttachTarget = card;
        event.type = DeployType.LeaderUpgrade;
    }

    public override checkEventCondition(event: any, additionalProperties: Partial<IDeployAndAttachLeaderPilotProperties> = {}): boolean {
        return true;
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<IDeployAndAttachLeaderPilotProperties> = {}) {
        super.updateEvent(event, card, context, additionalProperties);
        event.setContingentEventsGenerator(() => {
            const properties = this.generatePropertiesFromContext(context);
            const entersPlayEvent = new GameEvent(EventName.OnUnitEntersPlay, context, {
                player: context.player,
                card: properties.leaderPilotCard
            });
            const attachUpgradeEvent = new GameEvent(EventName.OnUpgradeAttached, context, {
                parentCard: card,
                upgradeCard: properties.leaderPilotCard,
                newController: context.player,
            });


            return [
                entersPlayEvent,
                attachUpgradeEvent,
            ];
        });
    }
}
