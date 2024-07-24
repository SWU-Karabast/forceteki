const { UiPrompt } = require('./UiPrompt.js');
const GameActions = require('../gameActions/GameActions');
const { AbilityContext } = require('../AbilityContext');
const { Players } = require('../Constants');

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
    //         gameAction: GameActions.attach({ upgrade: this.upgradeCard }),
    //         onSelect: (player, card) => {
    //             GameActions.attach({ upgrade: this.upgradeCard }).resolve(card, new AbilityContext({ game: this.game, player: this.player, source: card }));
    //             return true;
    //         }
    //     });
    //     return true;
    // }
}

module.exports = UpgradePrompt;
