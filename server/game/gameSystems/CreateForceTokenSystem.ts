import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, TokenCardName, ZoneName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { MoveCardSystem } from './MoveCardSystem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICreateForceTokenProperties extends IPlayerTargetSystemProperties {}

export class CreateForceTokenSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ICreateForceTokenProperties> {
    public override name = 'createForceToken';
    protected override eventName = EventName.OnTokensCreated;

    // event handler doesn't do anything since the token is generated in updateEvent
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event, additionalProperties = {}): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        return ['the force is with {0}', [context.player]];
    }

    protected override updateEvent(event, player: Player, context: TContext, additionalProperties): void {
        super.updateEvent(event, player, context, additionalProperties);

        const forceToken = context.game.generateToken(player, TokenCardName.Force);

        event.generatedTokens = [forceToken];

        event.setContingentEventsGenerator((event) => {
            const moveCardEvent = new MoveCardSystem({
                target: forceToken,
                destination: ZoneName.Base,
            }).generateEvent(event.context);

            return [moveCardEvent];
        });
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties?: {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        event.tokenType = TokenCardName.Force;
    }
}