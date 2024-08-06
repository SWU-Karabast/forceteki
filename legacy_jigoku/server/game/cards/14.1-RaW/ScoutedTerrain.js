const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Durations } = require('../../Constants');

class ScoutedTerrain extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Allow attacking the stronghold',
            condition: context => context.player.opponent && context.player.getNumberOfOpponentsFaceupProvinces() >= 4,
            effect: 'allow {1}\'s stronghold to be attacked this phase',
            effectArgs: context => [context.player.opponent],
            gameAction: AbilityDsl.actions.playerLastingEffect(context => ({
                targetController: context.player.opponent,
                duration: Durations.UntilEndOfPhase,
                effect: AbilityDsl.effects.strongholdCanBeAttacked()
            }))
        });
    }
}

ScoutedTerrain.id = 'scouted-terrain';

module.exports = ScoutedTerrain;

