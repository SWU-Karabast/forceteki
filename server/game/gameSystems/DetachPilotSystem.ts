import type { AbilityContext } from '../core/ability/AbilityContext';
import { InitializeCardStateOption, type Card } from '../core/card/Card';
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
    public override readonly eventName = EventName.OnCardMoved;
    public override readonly effectDescription = 'detach {0} and move it to the ground arena';
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.UnitUpgrade];

    public eventHandler(event: any): void {
        event.card.unattach(event);
        event.card.moveTo(ZoneName.GroundArena, InitializeCardStateOption.ForceInitialize);
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<IDetachPilotProperties>): void {
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

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IDetachPilotProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (!EnumHelpers.isUnitUpgrade(card.type)) {
            return false;
        }

        return super.canAffectInternal(card, context, additionalProperties, mustChangeGameState);
    }
}
