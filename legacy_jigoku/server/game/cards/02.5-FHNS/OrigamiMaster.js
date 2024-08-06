const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Players, CardTypes, CharacterStatus } = require('../../Constants');

class OrigamiMaster extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move an honor token',
            condition: context => context.source.isHonored,
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.moveStatusToken(context => ({
                    target: context.source.getStatusToken(CharacterStatus.Honored),
                    recipient: context.target
                }))
            }
        });
    }
}

OrigamiMaster.id = 'origami-master';

module.exports = OrigamiMaster;
