import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import {
    EventName,
    GameStateChangeRequired,
    WildcardCardType,
    ZoneName
} from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import * as EnumHelpers from '../core/utils/EnumHelpers';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDetachPilotProperties extends ICardTargetSystemProperties {}

export class DetachPilotSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDetachPilotProperties> {
    public override readonly name = 'detach';
    protected override readonly eventName = EventName.OnCardMoved;
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.UnitUpgrade];

    public eventHandler(event: any, additionalProperties = {}): void {
        event.card.unattach(event);
        event.card.moveTo(ZoneName.GroundArena, false);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { target } = this.generatePropertiesFromContext(context);

        return ['detaches {0} and moves it to the ground arena', [target]];
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.updateEvent(event, card, context, additionalProperties);

        Contract.assertTrue(card.isUpgrade());

        event.setContingentEventsGenerator(() => [
            new GameEvent(
                EventName.OnUpgradeUnattached,
                context,
                {
                    card,
                    upgradeCard: card,
                    parentCard: card.parentCard,
                }
            )
        ]);
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!EnumHelpers.isUnitUpgrade(card.type)) {
            return false;
        }

        return super.canAffect(card, context, additionalProperties, mustChangeGameState);
    }
}
