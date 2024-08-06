const DrawCard = require('../../drawcard.js');

class LocalDaimyosRetainer extends DrawCard {
    canPlay(context, playType) {
        return context.player.getNumberOfFaceupProvinces() >= 3 && super.canPlay(context, playType);
    }
}

LocalDaimyosRetainer.id = 'local-daimyo-s-retainer';

module.exports = LocalDaimyosRetainer;
