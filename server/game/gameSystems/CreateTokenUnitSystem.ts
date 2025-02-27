import type { AbilityContext } from '../core/ability/AbilityContext';
import type { TokenUnitName } from '../core/Constants';
import { EventName } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type Player from '../core/Player';
import * as Helpers from '../core/utils/Helpers';
import { PutIntoPlaySystem } from './PutIntoPlaySystem';

export interface ICreateTokenUnitProperties extends IPlayerTargetSystemProperties {
    amount?: number;
    entersReady?: boolean;
}

/** Base class for managing the logic for creating token units and putting them into play */
export abstract class CreateTokenUnitSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ICreateTokenUnitProperties> {
    public override readonly eventName = EventName.OnTokensCreated;
    protected override readonly defaultProperties: ICreateTokenUnitProperties = {
        amount: 1,
        entersReady: false
    };

    // event handler doesn't do anything since the tokens were generated in updateEvent
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event, additionalProperties = {}): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (properties.amount === 1) {
            return ['{0} creates a {1}', [properties.target, this.getTokenType()]];
        }
        return ['{0} creates {1} {2}s', [properties.target, properties.amount, this.getTokenType()]];
    }

    protected abstract getTokenType(): TokenUnitName;

    protected override updateEvent(event, player: Player, context: TContext, additionalProperties): void {
        super.updateEvent(event, player, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        // generate the tokens here so they can be used in the contingent events
        // it's fine if this event ends up being cancelled, unused tokens are cleaned up at the end of every round
        event.generatedTokens = [];
        for (const player of Helpers.asArray(properties.target)) {
            for (let i = 0; i < properties.amount; i++) {
                event.generatedTokens.push(context.game.generateToken(player, this.getTokenType()));
            }
        }

        // add contingent events for putting the generated unit token(s) into play
        event.setContingentEventsGenerator((event) => {
            const events = [];

            for (const token of event.generatedTokens) {
                const putIntoPlayEvent = new PutIntoPlaySystem({
                    controller: player,
                    target: token,
                    entersReady: event.entersReady
                }).generateEvent(event.context);

                putIntoPlayEvent.order = event.order + 1;

                events.push(putIntoPlayEvent);
            }

            return events;
        });
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    public override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties?: any): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        event.amount = properties.amount;
        event.tokenType = this.getTokenType();
        event.entersReady = properties.entersReady;
    }
}
