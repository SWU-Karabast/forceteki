import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired, ZoneName } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { addLastKnownInformationToEvent } from '../core/event/LastKnownInformation';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { Contract } from '../core/utils/Contract';
import { Helpers } from '../core/utils/Helpers';

export class UseTheForceSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends PlayerTargetSystem<TContext, TProperties> {
    public override name = 'useTheForce';
    public override readonly eventName = EventName.OnCardLeavesPlay;
    public override readonly costDescription: string = 'using the Force';
    public override readonly effectDescription: string = 'use the Force';

    protected override eventHandlerInternal(event): void {
        const forceToken = event.card;

        Contract.assertNotNullLike(forceToken, `Force token should not be null for player ${event.context.player.name}.`);

        forceToken.moveTo(ZoneName.OutsideTheGame);
    }

    protected override getEffectMessageInternal(context: TContext, properties: TProperties): [string, any[]] {
        if (Helpers.asArray(properties.target).length === 1 && context.player === Helpers.asArray(properties.target)[0]) {
            return super.getEffectMessageInternal(context, properties);
        }

        return ['make {0} use the Force', [this.getTargetMessage(properties.target, context)]];
    }

    public override defaultTargets(context: TContext): Player[] {
        return context.player.hasTheForce ? [context.player] : [];
    }

    protected override canAffectInternal(player: Player, context: TContext, properties: TProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && !player.hasTheForce) {
            return false;
        }

        return super.canAffectInternal(player, context, properties, mustChangeGameState);
    }

    protected override updateEvent(event, player: Player, context: TContext, properties: TProperties, additionalProperties: Partial<IGameSystemInput<TProperties>> = {}): void {
        super.updateEvent(event, player, context, properties, additionalProperties);

        Contract.assertTrue(player.hasTheForce);

        event.setContingentEventsGenerator(() => [
            new GameEvent(
                EventName.OnForceUsed,
                context,
                { player }
            )
        ]);

        addLastKnownInformationToEvent(event, player.baseZone.forceToken);
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, properties: TProperties): void {
        super.addPropertiesToEvent(event, player, context, properties);

        event.card = player.baseZone.forceToken;
    }
}