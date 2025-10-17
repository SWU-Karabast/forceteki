import { AllPlayerPrompt } from './AllPlayerPrompt';
import type { IPlayerPromptStateProperties } from '../../PlayerPromptState';
import type Game from '../../Game';
import * as Contract from '../../utils/Contract';
import * as Helpers from '../../utils/Helpers';
import { DeckZoneDestination, EffectName } from '../../Constants';
import { TriggerHandlingMode } from '../../event/EventWindow';
import { DrawSystem } from '../../../gameSystems/DrawSystem';

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

    public override activePromptInternal(): IPlayerPromptStateProperties {
        return {
            menuTitle: 'Choose whether to mulligan or keep your hand',
            buttons: [{ text: 'Mulligan', arg: 'mulligan' }, { text: 'Keep', arg: 'keep' }],
            promptTitle: 'Mulligan Step',
            promptUuid: this.uuid
        };
    }

    public override waitingPrompt() {
        return {
            menuTitle: 'Waiting for opponent to choose whether to mulligan'
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

                new DrawSystem({ amount: player.getStartingHandSize() })
                    .resolve(
                        player,
                        this.game.getFrameworkContext(player),
                        TriggerHandlingMode.ResolvesTriggers
                    );
            } else {
                // Perform a fake shuffle to ensure that the same amount of random numbers are generated
                // in case the game was rolled back to before the mulligan decision and the players make
                // different choices. For example, if both players decide to mulligan and after the rollback
                // player1 decides to keep instead, we want player2 to draw the same cards as before.
                Helpers.shuffle([
                    ...player.deckZone.getCards(),
                    ...player.hand,
                ], this.game.randomGenerator);
            }
        }
        return super.complete();
    }
}
