const OngoingEffect = require('./OngoingEffect.js');
const { RelativePlayer, WildcardRelativePlayer } = require('../Constants.js');

class OngoingPlayerEffect extends OngoingEffect {
    constructor(game, source, properties, effect) {
        super(game, source, properties, effect);
        this.targetController = properties.targetController || RelativePlayer.Self;
        if (typeof this.matchTarget !== 'function') {
            this.matchTarget = (player) => true;
        }
    }

    /** @override */
    isValidTarget(target) {
        if (this.targetController !== WildcardRelativePlayer.Any && this.targetController !== RelativePlayer.Self && this.targetController !== RelativePlayer.Opponent && this.targetController !== target) {
            return false;
        }

        if (this.targetController === RelativePlayer.Self && target === this.source.controller.opponent) {
            return false;
        } else if (this.targetController === RelativePlayer.Opponent && target === this.source.controller) {
            return false;
        }
        return true;
    }

    /** @override */
    getTargets() {
        return this.game.getPlayers().filter((player) => this.matchTarget(player));
    }
}

module.exports = OngoingPlayerEffect;
