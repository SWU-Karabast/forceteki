const DrawCard = require('../../../drawcard.js');
const { Phases } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');

class SoshiMika extends DrawCard {
    setupCardAbilities() {
        this.forcedReaction({
            title: 'After the conflict phase begins',
            when: {
                onPhaseStarted: event => event.phase === Phases.Conflict
            },
            effect: 'have each player lose an honor and draw two cards',
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.loseHonor(context => ({
                    target: context.game.getPlayers()
                })),
                AbilityDsl.actions.draw(context => ({
                    target: context.game.getPlayers(),
                    amount: 2
                }))
            ])
        });

        this.action({
            title: 'Flip the Imperial Favor',
            gameAction: AbilityDsl.actions.flipImperialFavor(context => ({
                target: context.player.imperialFavor ? context.player : context.player.opponent
            }))
        });
    }
}

SoshiMika.id = 'soshi-mika';

module.exports = SoshiMika;
