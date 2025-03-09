import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DeployType, EventName, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { GameEvent } from '../core/event/GameEvent';
import type { ILeaderUnitCard } from '../core/card/LeaderUnitCard';

export interface IFlipAndAttachLeaderPilotProperties extends ICardTargetSystemProperties {
    leaderPilotCard: ILeaderUnitCard;
}

export class FlipAndAttachPilotLeaderSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IFlipAndAttachLeaderPilotProperties> {
    public override readonly name = 'flip and attach pilot leader';
    public override readonly eventName = EventName.OnLeaderFlipped;

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

    public override getEffectMessage(context: TContext, additionalProperties: any = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return ['flip {0} and attach it to {1}', [properties.leaderPilotCard, properties.target]];
    }

    public override canAffect(card: Card, context: TContext): boolean {
        const properties = this.generatePropertiesFromContext(context);

        if (!card.isUnit()) {
            return false;
        }

        if (!properties.leaderPilotCard.canAttach(card, context)) {
            return false;
        }

        return super.canAffect(card, context);
    }

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        const properties = this.generatePropertiesFromContext(context);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.card = properties.leaderPilotCard;
        event.leaderAttachTarget = card;
        event.type = DeployType.LeaderUpgrade;
    }

    public override checkEventCondition(event: any, additionalProperties = {}): boolean {
        return true;
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: any = {}) {
        super.updateEvent(event, card, context, additionalProperties);
        event.setContingentEventsGenerator(() => {
            const properties = this.generatePropertiesFromContext(context, additionalProperties);
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
