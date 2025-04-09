import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, TokenCardName, ZoneName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { MoveCardSystem } from './MoveCardSystem';
import * as Helpers from '../core/utils/Helpers';

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

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override updateEvent(event, player: Player, context: TContext, additionalProperties): void {
        super.updateEvent(event, player, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        event.generatedTokens = [];

        for (const player of Helpers.asArray(properties.target)) {
            if (player.hasTheForce()) {
                continue;
            }
            event.generatedTokens.push(context.game.generateToken(player, TokenCardName.Force));
        }

        event.setContingentEventsGenerator((event) => {
            const events = [];

            for (const token of event.generatedTokens) {
                const moveCardEvent = new MoveCardSystem({
                    target: token,
                    destination: ZoneName.Base,
                }).generateEvent(event.context);

                events.push(moveCardEvent);
            }

            return events;
        });
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties?: {}): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        event.tokenType = TokenCardName.Force;
    }
}