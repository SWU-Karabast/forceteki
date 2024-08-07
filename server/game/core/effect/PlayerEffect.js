const Effect = require('./Effect.js');
const { RelativePlayer } = require('../Constants.js');

class PlayerEffect extends Effect {
    constructor(game, source, properties, effect) {
        super(game, source, properties, effect);
        this.targetController = properties.targetController || RelativePlayer.Self;
        if(typeof this.match !== 'function') {
            this.match = player => true; // eslint-disable-line no-unused-vars
        }

    }

    /** @override */
    isValidTarget(target) {
        if(this.targetController !== RelativePlayer.Any && this.targetController !== RelativePlayer.Self && this.targetController !== RelativePlayer.Opponent && this.targetController !== target) {
            return false;
        }

        if(this.targetController === RelativePlayer.Self && target === this.source.controller.opponent) {
            return false;
        } else if(this.targetController === RelativePlayer.Opponent && target === this.source.controller) {
            return false;
        }
        return true;
    }

    /** @override */
    getTargets() {
        return this.game.getPlayers().filter(player => this.match(player));
    }
}

module.exports = PlayerEffect;
