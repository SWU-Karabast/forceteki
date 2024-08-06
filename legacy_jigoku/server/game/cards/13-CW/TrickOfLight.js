const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Durations } = require('../../Constants');

class TrickOfTheLight extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'blanks printed text for conflict',
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    effect: AbilityDsl.effects.blank(),
                    duration: Durations.UntilEndOfConflict
                }))
            }
        });
    }
}

TrickOfTheLight.id = 'trick-of-the-light';
module.exports = TrickOfTheLight;
