const { UiPrompt } = require('./UiPrompt.js');
const GameSystems = require('../gameSystems/GameSystemLibrary.js');
const { AbilityContext } = require('../AbilityContext');
const { Players } = require('../core/Constants.js');

class UpgradePrompt extends UiPrompt {
    constructor(game, player, upgradeCard, playingType) {
        super(game);
        this.player = player;
        this.upgradeCard = upgradeCard;
        this.playingType = playingType;
    }

    // continue() {
    //     this.game.promptForSelect(this.player, {
    //         source: 'Play Upgrade',
    //         activePromptTitle: 'Select target for upgrade',
    //         controller: Players.Self,
    //         gameSystem: GameSystems.attach({ upgrade: this.upgradeCard }),
    //         onSelect: (player, card) => {
    //             GameSystems.attach({ upgrade: this.upgradeCard }).resolve(card, new AbilityContext({ game: this.game, player: this.player, source: card }));
    //             return true;
    //         }
    //     });
    //     return true;
    // }
}

module.exports = UpgradePrompt;
