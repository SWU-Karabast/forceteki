import type { Game } from '../../Game';
import type { OngoingEffectSourceBase } from '../../ongoingEffect/OngoingEffectSource';
import { OngoingEffectSource } from '../../ongoingEffect/OngoingEffectSource';
import type { Player } from '../../Player';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import { PromptType, type IButton } from '../PromptInterfaces';
import { UiPrompt } from './UiPrompt';

export interface IPassDelayPromptProperties {
    source?: string | OngoingEffectSourceBase;
    activePromptTitle?: string;
}

/**
 * Prompt that blocks the active player with a brief, client-driven, skippable pause.
 *
 * Its sole purpose is to mask hidden information: when an optional effect that depends on
 * secret information (e.g. disclose) cannot be performed, resolving it instantly would leak
 * to the opponent that the player's hidden cards can't satisfy the requirement. Queuing this
 * prompt instead makes the interaction indistinguishable from a player who could act but
 * declined. The randomized wait and Skip control live entirely on the client so the engine
 * remains deterministic.
 */
export class PassDelayPrompt extends UiPrompt {
    private readonly player: Player;
    private readonly source: OngoingEffectSourceBase;
    private readonly activePromptTitle: string;
    private readonly skipButton: IButton = { text: 'Skip', arg: 'done' };

    public constructor(game: Game, player: Player, properties: IPassDelayPromptProperties) {
        super(game);

        this.player = player;
        this.source = typeof properties.source === 'string'
            ? new OngoingEffectSource(game, properties.source)
            : properties.source ?? new OngoingEffectSource(game);
        this.activePromptTitle = properties.activePromptTitle ?? 'Pausing';
    }

    public override activeCondition(player: Player): boolean {
        return player === this.player;
    }

    public override activePromptInternal(): IPlayerPromptStateProperties {
        return {
            menuTitle: this.activePromptTitle,
            buttons: [this.skipButton],
            promptTitle: this.source.name,
            promptUuid: this.uuid,
            promptType: PromptType.PassDelay,
        };
    }

    protected override isOpponentRevealNewInfoPrompt(): boolean {
        return false;
    }

    public override menuCommand(player: Player, arg: string, uuid: string): boolean {
        this.checkPlayerAndUuid(player, uuid);
        this.complete();
        return true;
    }
}
