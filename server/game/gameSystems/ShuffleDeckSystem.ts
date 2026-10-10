import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { Helpers } from '../core/utils/Helpers';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import type { FormatMessage } from '../core/chat/GameChat';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IShuffleDeckProperties extends IPlayerTargetSystemProperties {}

export class ShuffleDeckSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IShuffleDeckProperties> {
    public override readonly name = 'shuffle';
    public override readonly eventName = EventName.OnDeckShuffled;

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    protected override eventHandlerInternal(event): void {
        for (const player of Helpers.asArray(event.player)) {
            player.shuffleDeck();
        }
    }

    protected override getEffectMessageInternal(context: TContext, properties: IShuffleDeckProperties): [string, any[]] {
        const players = Helpers.asArray(properties.target);

        const effectMessage = (player: Player): FormatMessage => {
            const targetIsSelf = player === context.player;
            const targetMessage: string | FormatMessage = targetIsSelf ? 'their' : { format: '{0}\'s', args: [player] };

            return {
                format: 'shuffle {0} deck',
                args: [targetMessage]
            };
        };

        return [ChatHelpers.formatWithLength(players.length, 'to '), players.map((player) => effectMessage(player))];
    }
}