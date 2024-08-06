const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class Enlightenment extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Resolve all claimed ring effects',
            condition: context => context.player.getClaimedRings().length > 0,
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.resolveRingEffect(context => ({
                    player: context.player,
                    target: context.player.getClaimedRings()
                })),
                AbilityDsl.actions.handler({
                    handler: context => {
                        if(context.player.getClaimedRings().length >= 5) {
                            this.game.recordWinner(context.player, 'enlightenment');
                        }
                    }
                })
            ]),
            effect: 'resolve all claimed ring effects'
        });
    }
}

Enlightenment.id = 'enlightenment';

module.exports = Enlightenment;
