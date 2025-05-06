import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired, ZoneName } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import * as Contract from '../core/utils/Contract';

export class UseTheForceSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends PlayerTargetSystem<TContext, TProperties> {
    public override name = 'useTheForce';
    protected override eventName = EventName.OnCardLeavesPlay;

    public override eventHandler(event): void {
        const forceToken = event.context.player.baseZone.forceToken;

        Contract.assertNotNullLike(forceToken, `Force token should not be null for player ${event.context.player.name}.`);

        forceToken.moveTo(ZoneName.OutsideTheGame);
    }

    public override canAffectInternal(player: Player, context: TContext, additionalProperties: Partial<TProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context);

        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && !context.player.hasTheForce) {
            return false;
        }

        return super.canAffectInternal(player, context, additionalProperties, mustChangeGameState);
    }
}