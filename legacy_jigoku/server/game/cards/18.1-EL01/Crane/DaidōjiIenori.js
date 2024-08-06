const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl');
const { CardTypes, Players } = require('../../../Constants');

class DaidojiIenori extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Set a participating character to 3/3',
            condition: (context) => context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect(context => {
                    const effect = [
                        AbilityDsl.effects.setMilitarySkill(3),
                        AbilityDsl.effects.setPoliticalSkill(3)
                    ];
                    if(context.source.isHonored) {
                        effect.push(AbilityDsl.effects.cardCannot('receiveDishonorToken'));
                        effect.push(AbilityDsl.effects.cardCannot('receiveHonorToken'));
                    }
                    return {
                        effect: effect
                    };
                })
            },
            effect: 'set the skills of {0} to 3{1}/3{2}{3}',
            effectArgs: context => ['military', 'political', context.source.isHonored ? ' and prevent them from receiving status tokens' : '']
        });
    }
}

DaidojiIenori.id = 'daidoji-ienori';

module.exports = DaidojiIenori;
