const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes, Players, TargetModes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class TheRecedingTide extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Return a character to a province',
            target: {
                cardType: CardTypes.Character,
                location: Locations.PlayArea,
                mode: TargetModes.Single,
                cardCondition: card => !card.hasTrait('mythic') && card.owner === this.controller,
                gameAction: AbilityDsl.actions.selectCard(context => ({
                    targets: false,
                    cardType: CardTypes.Province,
                    controller: Players.Self,
                    location: Locations.Provinces,
                    cardCondition: card => card.location !== Locations.StrongholdProvince,
                    subActionProperties: card => ({ destination: card.location }),
                    gameAction: AbilityDsl.actions.putIntoProvince({
                        target: context.target
                    })
                }))
            }
        });
    }
}

TheRecedingTide.id = 'the-receding-tide';

module.exports = TheRecedingTide;
