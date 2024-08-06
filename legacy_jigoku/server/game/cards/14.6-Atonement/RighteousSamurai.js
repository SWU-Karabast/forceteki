const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants');

class RighteousSamurai extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Honor a character',
            when: {
                onModifyHonor: (event, context) => {
                    const honorLoss = event.amount < 0;
                    const viaOpponentsEffect = (context.player.opponent === event.context.player);
                    const viaRingEffect = (event.context.source.type === 'ring');
                    const viaCardEffect = event.context.ability.isCardAbility();
                    const honorLossBelongsToController = event.player === context.player;
                    return honorLoss && viaOpponentsEffect && honorLossBelongsToController && (viaRingEffect || viaCardEffect);
                },
                onTransferHonor: (event, context) => {
                    const honorLoss = event.amount > 0;
                    const viaOpponentsEffect = (context.player.opponent === event.context.player);
                    const viaRingEffect = (event.context.source.type === 'ring');
                    const viaCardEffect = event.context.ability.isCardAbility();
                    const honorLossBelongsToController = event.player === context.player;
                    return honorLoss && viaOpponentsEffect && honorLossBelongsToController && (viaRingEffect || viaCardEffect);
                }
            },
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.honor()
            }
        });
    }
}

RighteousSamurai.id = 'righteous-samurai';

module.exports = RighteousSamurai;
