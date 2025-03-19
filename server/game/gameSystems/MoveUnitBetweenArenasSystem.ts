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

export enum MoveArenaType {
    SpaceToGround = 'spaceToGround',
    GroundToSpace = 'groundToSpace'
}

export interface IMoveUnitBetweenArenasProperties extends ICardTargetSystemProperties {
    moveType: MoveArenaType;
}

export class MoveUnitBetweenArenasSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IMoveUnitBetweenArenasProperties> {
    public override readonly name = 'move';
    protected override readonly eventName = EventName.OnCardMoved;
    public override targetTypeFilter = [WildcardCardType.Unit];

    public eventHandler(event: any, additionalProperties = {}): void {
        (event.card as Card).moveTo(event.destination, InitializeCardStateOption.DoNotInitialize);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const { moveType, target } = this.generatePropertiesFromContext(context);
        const moveTypeString = moveType === MoveArenaType.SpaceToGround
            ? 'from the space arena to the ground arena'
            : 'from the ground arena to the space arena';

        return ['move {0} ' + moveTypeString, [target]];
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.updateEvent(event, card, context, additionalProperties);

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
                    (event) => (event as any).card.moveTo((event as any).destination)
                );

                moveEvent.order = event.order + 1;

                moveEvent.isContingent = true;
                moveUpgradeEvents.push(moveEvent);
            }

            return moveUpgradeEvents;
        });
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.moveType = properties.moveType;
        event.destination = this.getDestination(properties);
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { moveType } = this.generatePropertiesFromContext(context, additionalProperties);

        if (
            (moveType === MoveArenaType.SpaceToGround && card.zoneName !== ZoneName.SpaceArena) ||
            (moveType === MoveArenaType.GroundToSpace && card.zoneName !== ZoneName.GroundArena)
        ) {
            return false;
        }

        return super.canAffect(card, context, additionalProperties, mustChangeGameState);
    }

    private getDestination(properties: IMoveUnitBetweenArenasProperties): ZoneName {
        return properties.moveType === MoveArenaType.SpaceToGround ? ZoneName.GroundArena : ZoneName.SpaceArena;
    }
}
