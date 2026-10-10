import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
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
import { Contract } from '../core/utils/Contract';

export enum MoveArenaType {
    SpaceToGround = 'spaceToGround',
    GroundToSpace = 'groundToSpace'
}

export interface IMoveUnitBetweenArenasProperties extends ICardTargetSystemProperties {
    moveType: MoveArenaType;
}

export class MoveUnitBetweenArenasSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IMoveUnitBetweenArenasProperties> {
    public override readonly name = 'move';
    public override readonly eventName = EventName.OnCardMoved;
    public override targetTypeFilter = [WildcardCardType.Unit];

    protected override eventHandlerInternal(event: any): void {
        (event.card as Card).moveTo(event.destination, InitializeCardStateOption.DoNotInitialize);
    }

    protected override getEffectMessageInternal(context: TContext, properties: IMoveUnitBetweenArenasProperties): [string, any[]] {
        const { moveType, target } = properties;
        const moveTypeString = moveType === MoveArenaType.SpaceToGround
            ? 'from the space arena to the ground arena'
            : 'from the ground arena to the space arena';

        return [`move {0} ${moveTypeString}`, [this.getTargetMessage(target, context)]];
    }

    protected override updateEvent(event, card: Card, context: TContext, properties: IMoveUnitBetweenArenasProperties, additionalProperties: Partial<IGameSystemInput<IMoveUnitBetweenArenasProperties>> = {}): void {
        super.updateEvent(event, card, context, properties, additionalProperties);

        Contract.assertTrue(card.isUnit());

        event.setContingentEventsGenerator(() => {
            const moveUpgradeEvents = [];

            for (const upgrade of card.upgrades) {
                const moveEvent = new GameEvent(
                    EventName.OnCardMoved,
                    context,
                    {
                        card: upgrade,
                        destination: event.destination,
                    },
                    (event) => (event as any).card.moveTo((event as any).destination, InitializeCardStateOption.DoNotInitialize)
                );

                moveEvent.order = event.order + 1;

                moveEvent.isContingent = true;
                moveUpgradeEvents.push(moveEvent);
            }

            return moveUpgradeEvents;
        });
    }

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, properties: IMoveUnitBetweenArenasProperties): void {
        super.addPropertiesToEvent(event, card, context, properties);

        event.moveType = properties.moveType;
        event.destination = this.getDestination(properties);
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IMoveUnitBetweenArenasProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { moveType } = properties;

        if (
            (moveType === MoveArenaType.SpaceToGround && card.zoneName !== ZoneName.SpaceArena) ||
            (moveType === MoveArenaType.GroundToSpace && card.zoneName !== ZoneName.GroundArena)
        ) {
            return false;
        }

        return super.canAffectInternal(card, context, properties, mustChangeGameState);
    }

    private getDestination(properties: IMoveUnitBetweenArenasProperties): ZoneName {
        return properties.moveType === MoveArenaType.SpaceToGround ? ZoneName.GroundArena : ZoneName.SpaceArena;
    }
}
