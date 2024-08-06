const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Players, CardTypes, EventNames } = require('../../Constants');

class AgashaProdigys extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard a card to try and attach it to a character',
            cost: AbilityDsl.costs.optionalHonorTransferFromOpponentCost(context => {
                return context.player.opponent && context.player.opponent.conflictDeck.size() > 0;
            }),
            targets: {
                myCharacter: {
                    cardType: CardTypes.Character,
                    gameAction: AbilityDsl.actions.sequential([
                        AbilityDsl.actions.discardCard(context => ({
                            target: context.player.conflictDeck.first()
                        })),
                        AbilityDsl.actions.ifAble(context => ({
                            ifAbleAction: AbilityDsl.actions.attach({
                                target: context.targets.myCharacter,
                                attachment: this.getDiscardedCards(context).length > 0 ? this.getDiscardedCards(context)[0] : false
                            }),
                            otherwiseAction: AbilityDsl.actions.discardFromPlay({ target: [] })
                        }))
                    ])
                },
                oppCharacter: {
                    player: Players.Opponent,
                    cardType: CardTypes.Character,
                    optional: true,
                    hideIfNoLegalTargets: true,
                    cardCondition: (card, context) => context.costs.optionalHonorTransferFromOpponentCostPaid,
                    gameAction: AbilityDsl.actions.sequential([
                        AbilityDsl.actions.discardCard(context => ({
                            target: context.targets.oppCharacter ? context.player.opponent.conflictDeck.first() : []
                        })),
                        AbilityDsl.actions.ifAble(context => ({
                            ifAbleAction: AbilityDsl.actions.attach({
                                target: context.targets.oppCharacter,
                                attachment: this.getDiscardedCards(context).length > 1 ? this.getDiscardedCards(context)[1] : false
                            }),
                            otherwiseAction: AbilityDsl.actions.discardFromPlay({ target: [] })
                        }))
                    ])
                }
            },
            effect: 'discard the top card of their deck and attempt to attach it to {1}{2}',
            effectArgs: context => [context.targets.myCharacter, this.buildString(context)]
        });
    }

    getDiscardedCards(context) {
        let events = context.events.filter(event => event.name === EventNames.OnCardsDiscarded);
        if(events.length > 0) {
            let cards = [];
            events.forEach(a => cards = cards.concat(a.cards));
            return cards;
        }

        return [];
    }

    buildString(context) {
        if(context.targets.oppCharacter && !Array.isArray(context.targets.oppCharacter)) {
            let target = context.targets.oppCharacter;
            return '.  ' + context.player.opponent.name + ' gives ' + context.player.name + ' 1 honor to discard the top card of their deck and attempt to attach it to ' + target.name;
        }
        return '';
    }
}

AgashaProdigys.id = 'agasha-prodigy';

module.exports = AgashaProdigys;
