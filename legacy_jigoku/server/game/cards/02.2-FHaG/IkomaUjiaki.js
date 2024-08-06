const DrawCard = require('../../drawcard.js');
const { Locations, Players, TargetModes, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class IkomaUjiaki extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Put characters into play',
            condition: context => context.source.isParticipating(),
            cost: AbilityDsl.costs.discardImperialFavor(),
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.reveal(context => ({
                    target: context.player.getDynastyCardsInProvince(Locations.Provinces)
                })),
                AbilityDsl.actions.selectCard(context => ({
                    activePromptTitle: 'Choose up to two characters',
                    numCards: 2,
                    targets: true,
                    mode: TargetModes.UpTo,
                    optional: true,
                    cardType: CardTypes.Character,
                    location: [Locations.Provinces],
                    controller: Players.Self,
                    cardCondition: card => card.isFaceup() && card.allowGameAction('putIntoConflict', context),
                    message: '{0} puts {1} into play into the conflict',
                    messageArgs: cards => [context.player, cards],
                    gameAction: AbilityDsl.actions.putIntoConflict()
                }))
            ]),
            effect: 'reveal their dynasty cards and put up to two of them into play'
        });
    }
}

IkomaUjiaki.id = 'ikoma-ujiaki';

module.exports = IkomaUjiaki;
