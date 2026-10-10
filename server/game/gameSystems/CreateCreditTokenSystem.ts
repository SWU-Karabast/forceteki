import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, TokenCardName, ZoneName } from '../core/Constants';
import { PlayerTargetSystem, type IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import type { Player } from '../core/Player';
import type { FormatMessage } from '../core/chat/GameChat';
import { Helpers } from '../core/utils/Helpers';

export interface ICreateCreditTokenProperties extends IPlayerTargetSystemProperties {
    amount?: number;
}

export class CreateCreditTokenSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ICreateCreditTokenProperties> {
    public override readonly eventName = EventName.OnTokensCreated;
    protected override readonly defaultProperties: IGameSystemInput<ICreateCreditTokenProperties> = {
        amount: 1
    };

    protected override eventHandlerInternal(event): void {
        for (const token of event.generatedTokens) {
            token.moveTo(ZoneName.Base);
        }
    }

    protected override getEffectMessageInternal(context: TContext, properties: ICreateCreditTokenProperties): [string, any[]] {
        const players = Helpers.asArray(properties.target);

        const effectMessage = (player: Player): FormatMessage => {
            const targetIsSelf = player === context.player;
            const creditTokenText = ChatHelpers.pluralize(properties.amount, 'a Credit token', 'Credit tokens');

            if (targetIsSelf) {
                return {
                    format: 'create {0}',
                    args: [creditTokenText]
                };
            }

            return {
                format: 'make {0} create {1}',
                args: [player, creditTokenText]
            };
        };

        return [ChatHelpers.formatWithLength(players.length, 'to '), players.map((player) => effectMessage(player))];
    }

    protected override updateEvent(event, player: Player, context: TContext, properties: ICreateCreditTokenProperties, additionalProperties: Partial<IGameSystemInput<ICreateCreditTokenProperties>> = {}): void {
        super.updateEvent(event, player, context, properties, additionalProperties);

        event.generatedTokens = [];

        for (let i = 0; i < properties.amount; i++) {
            event.generatedTokens.push(context.game.generateToken(player, TokenCardName.Credit));
        }
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, properties: ICreateCreditTokenProperties): void {
        super.addPropertiesToEvent(event, player, context, properties);

        event.amount = properties.amount;
        event.tokenType = TokenCardName.Credit;
    }
}