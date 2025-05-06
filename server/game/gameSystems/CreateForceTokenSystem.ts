import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired, TokenCardName, ZoneName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import * as Helpers from '../core/utils/Helpers';
import * as Contract from '../core/utils/Contract';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICreateForceTokenProperties extends IPlayerTargetSystemProperties {}

export class CreateForceTokenSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ICreateForceTokenProperties> {
    public override name = 'createForceToken';
    protected override eventName = EventName.OnTokensCreated;

    public override eventHandler(event, additionalProperties: Partial<ICreateForceTokenProperties> = {}): void {
        const context = event.context;
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        for (const player of Helpers.asArray(properties.target)) {
            const forceTokens = player.outsideTheGameZone
                .getCards({ condition: (card) => card.isForceToken() });

            Contract.assertEqual(forceTokens.length, 1, `There should be exactly one Force token in the outside the game zone for player ${player.name}.`);

            forceTokens[0].moveTo(ZoneName.Base);
        }
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        return ['the force is with {0}', [context.player]];
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties: Partial<ICreateForceTokenProperties>): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        event.tokenType = TokenCardName.Force;
    }

    public override canAffectInternal(player: Player, context: TContext, additionalProperties: Partial<ICreateForceTokenProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context);

        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && context.player.hasTheForce) {
            return false;
        }

        return super.canAffectInternal(player, context, additionalProperties, mustChangeGameState);
    }
}