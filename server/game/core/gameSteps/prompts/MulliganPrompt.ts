import { AllPlayerPrompt } from './AllPlayerPrompt';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import type Game from '../../Game';
import * as Contract from '../../utils/Contract';
import { DeckZoneDestination, EffectName } from '../../Constants';

export class MulliganPrompt extends AllPlayerPrompt {
    protected playersDone = new Map<string, boolean>();
    protected playerMulligan = new Map<string, boolean>();
    public constructor(game: Game) {
        super(game);
        for (const player of game.getPlayers()) {
            this.playersDone[player.name] = false;
            this.playerMulligan[player.name] = false;
        }
    }

    public override completionCondition(player): boolean {
        if (player.base.hasOngoingEffect(EffectName.NoMulligan)) {
            this.playersDone[player.name] = true;
        }
        return this.playersDone[player.name];
    }

    public override activePrompt(): IPlayerPromptStateProperties {
        return {
            menuTitle: 'Choose whether to mulligan or keep your hand',
            buttons: [{ text: 'Mulligan', arg: 'mulligan' }, { text: 'Keep', arg: 'keep' }],
            promptTitle: 'Mulligan Step',
            promptUuid: this.uuid
        };
    }

    public override waitingPrompt() {
        return {
            menuTitle: 'Waiting for opponent to choose whether to Mulligan or keep hand.'
        };
    }

    public override continue() {
        if (this.isComplete()) {
            this.complete();
        }
        return super.continue();
    }

    public override menuCommand(player, arg): boolean {
        if (arg === 'mulligan') {
            if (this.completionCondition(player)) {
                return false;
            }
            this.game.addMessage('{0} has mulliganed', player);
            this.playersDone[player.name] = true;
            this.playerMulligan[player.name] = true;
            return true;
        } else if (arg === 'keep') {
            this.game.addMessage('{0} has not mulliganed', player);
            this.playersDone[player.name] = true;
            return true;
        }
        // in the case the command comes as an invalid one
        Contract.fail(`Unexpected menu command: '${arg}'`);
    }

    public override complete() {
        for (const player of this.game.getPlayers()) {
            if (this.playerMulligan[player.name]) {
                for (const card of player.hand) {
                    card.moveTo(DeckZoneDestination.DeckBottom);
                }
                player.shuffleDeck();
                player.drawCardsToHand(player.getStartingHandSize());
            }
        }
        return super.complete();
    }
}
