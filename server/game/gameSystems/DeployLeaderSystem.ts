import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DeployType } from '../core/Constants';
import { CardType, EventName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { GameEvent } from '../core/event/GameEvent';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';

export interface IDeployLeaderProperties extends ICardTargetSystemProperties {
    deployType: DeployType;
    parentCard?: IUnitCard;
}

export class DeployLeaderSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDeployLeaderProperties> {
    public override readonly name = 'deploy leader';
    public override readonly eventName = EventName.OnLeaderDeployed;
    public override readonly effectDescription = 'deploy {0}';

    protected override readonly targetTypeFilter = [CardType.Leader];

    public eventHandler(event): void {
        Contract.assertNotNullLike(event.deployType);
        Contract.assertTrue(event.card.isDeployableLeader());

        if (event.deployType === DeployType.LeaderUpgrade) {
            Contract.assertNotNullLike(event.parentCard);
        }
        event.card.deploy(event.deployType, event.parentCard);
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

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        const properties = this.generatePropertiesFromContext(context);
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        event.deployType = properties.deployType;
        event.parentCard = properties.parentCard;
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
