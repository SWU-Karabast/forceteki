const DrawCard = require('../../drawcard.js');
const { TargetModes, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ProveYourSkill extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard a status token off a character',
            target: {
                mode: TargetModes.Token,
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.discardStatusToken()
            },
            effect: 'discard {1}\'s {2}',
            effectArgs: context => [
                context.token[0].card,
                context.token
            ]
        });
    }

    canPlay(context, playType) {
        if(context.player.opponent && context.player.isMoreHonorable()) {
            return super.canPlay(context, playType);
        }
        return false;
    }
}

ProveYourSkill.id = 'prove-your-skill';

module.exports = ProveYourSkill;
