import * as GameSystems from '../../../gameSystems/GameSystemLibrary';
import { AbilityContext } from '../../ability/AbilityContext';
import { UpgradeCard } from '../../card/UpgradeCard';
import { PlayType, RelativePlayer } from '../../Constants';
import Game from '../../Game';
import Player from '../../Player';
import { UiPrompt } from './UiPrompt';

export class AttachUpgradePrompt extends UiPrompt {
    public readonly player: Player;
    public readonly upgradeCard: UpgradeCard;
    public readonly playType: PlayType;

    public constructor(game: Game, player: Player, upgradeCard: UpgradeCard, playType: PlayType) {
        super(game);
        this.player = player;
        this.upgradeCard = upgradeCard;
        this.playType = playType;
    }

    public override continue() {
        this.game.promptForSelect(this.player, {
            source: 'Play Upgrade',
            activePromptTitle: 'Select target for Upgrade',
            controller: RelativePlayer.Self,
            gameAction: GameSystems.attachUpgrade({ upgrade: this.upgradeCard }),
            onSelect: (player, card) => {
                GameSystems.attachUpgrade({ upgrade: this.upgradeCard }).resolve(card, new AbilityContext({ game: this.game, player: this.player, source: card }));
                return true;
            }
        });
        return true;
    }

    // TODO: understand the UiPrompt flow better to figure out how to make these unnecessary
    public activePrompt(player: Player) {
        return undefined;
    }

    public menuCommand(player: Player, arg: string, method: string) {
        return undefined;
    }
}

