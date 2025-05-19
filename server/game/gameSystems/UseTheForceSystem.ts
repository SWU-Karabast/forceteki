import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired, ZoneName } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';

export class UseTheForceSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IPlayerTargetSystemProperties = IPlayerTargetSystemProperties> extends PlayerTargetSystem<TContext, TProperties> {
    public override name = 'useTheForce';
    protected override eventName = EventName.OnCardLeavesPlay;

    public override eventHandler(event): void {
        const forceToken = event.card;

        Contract.assertNotNullLike(forceToken, `Force token should not be null for player ${event.context.player.name}.`);

        forceToken.moveTo(ZoneName.OutsideTheGame);
    }

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<TProperties>): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (Helpers.asArray(properties.target).length === 1 && context.player === Helpers.asArray(properties.target)[0]) {
            return ['use the Force', []];
        }

        return ['make {0} use the Force', [properties.target]];
    }

    public override defaultTargets(context: TContext): Player[] {
        return context.player.hasTheForce ? [context.player] : [];
    }

    public override canAffectInternal(player: Player, context: TContext, additionalProperties: Partial<TProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && !player.hasTheForce) {
            return false;
        }

        return super.canAffectInternal(player, context, additionalProperties, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties?: Partial<TProperties>): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        event.card = player.baseZone.forceToken;
    }
}