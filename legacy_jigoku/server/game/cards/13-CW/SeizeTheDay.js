const DrawCard = require('../../drawcard.js');
const { Phases, EventNames } = require('../../Constants');

class SeizeTheDay extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Become first player',
            when: {
                onPhaseStarted: (event, context) => event.phase === Phases.Conflict && this.game.getFirstPlayer() !== context.player
            },
            handler: () => {
                let firstPlayer = this.game.getFirstPlayer();
                let otherPlayer = this.game.getOtherPlayer(firstPlayer);
                if(otherPlayer) {
                    this.game.raiseEvent(EventNames.OnPassFirstPlayer, { player: otherPlayer }, () => this.game.setFirstPlayer(otherPlayer));
                }
            },
            effect: 'become first player!'
        });
    }
}

SeizeTheDay.id = 'seize-the-day';

module.exports = SeizeTheDay;
