const { UiPrompt } = require('./UiPrompt.js');

class UpgradePrompt extends UiPrompt {
    constructor(game, player, upgradeCard, playingType) {
        super(game);
        this.player = player;
        this.upgradeCard = upgradeCard;
        this.playingType = playingType;
    }

    // TODO: why is this set up this way, with the prompt being in continue()?
    /** @override */
    activePromptInternal() {
        return undefined;
    }

    /** @override */
    menuCommand() {
        return true;
    }

    // continue() {
    //     this.game.promptForSelect(this.player, {
    //         source: 'Play Upgrade',
    //         activePromptTitle: 'Select target for upgrade',
    //         controller: RelativePlayer.Self,
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
