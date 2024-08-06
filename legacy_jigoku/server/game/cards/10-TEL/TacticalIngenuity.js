const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { AbilityTypes, CardTypes, Locations } = require('../../Constants.js');

class TacticalIngenuity extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            trait: 'commander'
        });
        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Reveal and draw an event',
                condition: (context) => context.source.isParticipating(),
                effect: 'look at the top four cards of their deck',
                gameAction: AbilityDsl.actions.deckSearch({
                    amount: 4,
                    cardCondition: (card) => card.type === CardTypes.Event,
                    gameAction: AbilityDsl.actions.moveCard({
                        destination: Locations.Hand
                    })
                })
            })
        });
    }
}

TacticalIngenuity.id = 'tactical-ingenuity';

module.exports = TacticalIngenuity;
