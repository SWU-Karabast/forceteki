import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import {
    EventName,
    GameStateChangeRequired,
    WildcardCardType,
    ZoneName
} from '../core/Constants';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';

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
        (event.card as Card).moveTo(event.destination, false);
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

        // Check if the card is leaving play
        if (EnumHelpers.isArena(card.zoneName) && !EnumHelpers.isArena(event.destination)) {
            this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
        }
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        event.moveType = properties.moveType;
        event.destination = properties.moveType === MoveArenaType.SpaceToGround ? ZoneName.GroundArena : ZoneName.SpaceArena;
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
}
