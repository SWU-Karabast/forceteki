const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class Logistics extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move a card in a province',
            targets: {
                cardInProvince: {
                    location: [Locations.Provinces, Locations.PlayArea],
                    player: Players.Any,
                    cardCondition: card =>
                        (card.isInProvince() && card.type !== CardTypes.Province && card.type !== CardTypes.Stronghold) ||
                        (card.type === CardTypes.Attachment && card.parent && card.parent.type === CardTypes.Province)
                },
                province: {
                    targets: false,
                    dependsOn: 'cardInProvince',
                    location: [Locations.Provinces],
                    cardType: CardTypes.Province,
                    player: Players.Any,
                    cardCondition: (card, context) =>
                        card.location !== Locations.StrongholdProvince &&
                        !card.isBroken &&
                        ( //same controller check
                            (context.targets.cardInProvince.type === CardTypes.Attachment && card.controller === context.targets.cardInProvince.parent.controller) ||
                            (context.targets.cardInProvince.type !== CardTypes.Attachment && card.controller === context.targets.cardInProvince.controller)
                        ) &&
                        ( //different location check
                            (context.targets.cardInProvince.type === CardTypes.Attachment && card.location !== context.targets.cardInProvince.parent.location) ||
                            (context.targets.cardInProvince.type !== CardTypes.Attachment && card.location !== context.targets.cardInProvince.location)
                        ),
                    gameAction: AbilityDsl.actions.multiple([
                        AbilityDsl.actions.conditional(context => ({
                            condition: context.targets.cardInProvince.type === CardTypes.Attachment,
                            trueGameAction: AbilityDsl.actions.attach({
                                target: context.targets.province,
                                attachment: context.targets.cardInProvince
                            }),
                            falseGameAction: AbilityDsl.actions.moveCard({
                                target: context.targets.cardInProvince,
                                destination: context.targets.province.location
                            })
                        })),
                        AbilityDsl.actions.draw(context => ({ target: context.game.isTraitInPlay('battlefield') ? context.player : [] }))
                    ])
                }
            },
            effect: 'move {1} to {2}{3}',
            effectArgs: context => [
                context.targets.cardInProvince.isFacedown() ? 'a facedown card' : context.targets.cardInProvince,
                context.targets.province.isFacedown() ? context.targets.province.location : context.targets.province,
                context.game.isTraitInPlay('battlefield') ? ' and draw a card' : ''
            ]
        });
    }
}

Logistics.id = 'logistics';

module.exports = Logistics;
