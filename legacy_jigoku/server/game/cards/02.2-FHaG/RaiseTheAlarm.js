const DrawCard = require('../../drawcard.js');
const { CardTypes, Locations, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class RaiseTheAlarm extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Flip a dynasty card',
            condition: context => this.game.isDuringConflict('military') && context.player.isDefendingPlayer(),
            cannotBeMirrored: true,
            effect: 'flip the card in the conflict province faceup',
            target: {
                controller: Players.Self,
                location: Locations.Provinces,
                cardCondition: card => card.isInConflictProvince() && card.isFacedown(),
                gameAction: AbilityDsl.actions.flipDynasty()
            },
            then: context => ({
                handler: () => {
                    let card = context.target;
                    if(card.type === CardTypes.Character && card.allowGameAction('putIntoConflict', context)) {
                        this.game.addMessage('{0} is revealed and brought into the conflict!', card);
                        AbilityDsl.actions.putIntoConflict().resolve(card, context);
                    } else {
                        this.game.addMessage('{0} is revealed but cannot be brought into the conflict!', card);
                    }
                }
            })
        });
    }
}

RaiseTheAlarm.id = 'raise-the-alarm';

module.exports = RaiseTheAlarm;
