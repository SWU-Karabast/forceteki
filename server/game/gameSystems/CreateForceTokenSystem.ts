import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired, TokenCardName, ZoneName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import * as Helpers from '../core/utils/Helpers';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICreateForceTokenProperties extends IPlayerTargetSystemProperties {}

export class CreateForceTokenSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ICreateForceTokenProperties> {
    public override name = 'createForceToken';
    protected override eventName = EventName.OnTokensCreated;

    public override eventHandler(event, additionalProperties = {}): void {
        for (const token of event.generatedTokens) {
            token.moveTo(ZoneName.Base);
        }
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        return ['the force is with {0}', [context.player]];
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override updateEvent(event, player: Player, context: TContext, additionalProperties): void {
        super.updateEvent(event, player, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        event.generatedTokens = [];

        for (const player of Helpers.asArray(properties.target)) {
            if (player.hasTheForce) {
                continue;
            }
            event.generatedTokens.push(context.game.generateToken(player, TokenCardName.Force));
        }
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        event.tokenType = TokenCardName.Force;
    }

    public override canAffectInternal(player: Player, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (mustChangeGameState !== GameStateChangeRequired.None && context.player.hasTheForce) {
            return false;
        }

        return super.canAffectInternal(player, context, additionalProperties, mustChangeGameState);
    }
}