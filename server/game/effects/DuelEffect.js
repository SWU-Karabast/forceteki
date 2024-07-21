const Effect = require('./Effect.js');

class DuelEffect extends Effect {
    constructor(game, source, properties, effect) {
        super(game, source, properties, effect);
        // Overide any erroneous match passed through properties
        this.match = () => true;
        this.duel = properties.target[0];
    }

    getTargets() {
        return this.duel ? [this.duel] : [];
    }
}

module.exports = DuelEffect;
