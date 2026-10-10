import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, GameStateChangeRequired, TokenCardName, ZoneName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { Helpers } from '../core/utils/Helpers';
import { Contract } from '../core/utils/Contract';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICreateForceTokenProperties extends IPlayerTargetSystemProperties {}

export class CreateForceTokenSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ICreateForceTokenProperties> {
    public override name = 'createForceToken';
    public override readonly eventName = EventName.OnTokensCreated;
    public override readonly effectDescription = 'gain the Force';

    protected override eventHandlerInternal(event): void {
        for (const token of event.generatedTokens) {
            token.moveTo(ZoneName.Base);
        }
    }

    protected override updateEvent(event, player: Player, context: TContext, properties: ICreateForceTokenProperties, additionalProperties: Partial<IGameSystemInput<ICreateForceTokenProperties>> = {}): void {
        super.updateEvent(event, player, context, properties, additionalProperties);

        event.generatedTokens = [];

        for (const player of Helpers.asArray(properties.target)) {
            if (player.hasTheForce) {
                continue;
            }

            const forceTokens = player.outsideTheGameZone
                .getCards({ condition: (card) => card.isForceToken() });

            Contract.assertEqual(forceTokens.length, 1, `There should be exactly one Force token in the outside the game zone for player ${player.name}.`);

            event.generatedTokens.push(forceTokens[0]);
        }
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, properties: ICreateForceTokenProperties): void {
        super.addPropertiesToEvent(event, player, context, properties);

        event.tokenType = TokenCardName.Force;
    }

    protected override canAffectInternal(player: Player, context: TContext, properties: ICreateForceTokenProperties, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && context.player.hasTheForce) {
            return false;
        }

        return super.canAffectInternal(player, context, properties, mustChangeGameState);
    }
}