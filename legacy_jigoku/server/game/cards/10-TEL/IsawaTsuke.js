const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { Elements, EventNames } = require('../../Constants.js');

const elementKey = 'isawa-tsuke-fire';

class IsawaTsuke extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Fire ring same cost characters',
            when: {
                onCardDishonored: (event, context) => {
                    const dishonoredByYourEffect = context.player === event.context.player;
                    const dishonoredByRingEffect = event.context.source.type === 'ring';
                    const currentlyFire = this.getCurrentElementSymbol(elementKey) === Elements.Fire;
                    return dishonoredByYourEffect && dishonoredByRingEffect && currentlyFire;
                },
                onCardHonored: (event, context) => {
                    const honoredByYourEffect = context.player === event.context.player;
                    const honoredByRingEffect = event.context.source.type === 'ring';
                    const currentlyFire = this.getCurrentElementSymbol(elementKey) === Elements.Fire;
                    return honoredByYourEffect && honoredByRingEffect && currentlyFire;
                }
            },
            gameAction: AbilityDsl.actions.conditional((context) => ({
                // @ts-ignore
                condition: context.event.name === EventNames.OnCardDishonored,
                trueGameAction: AbilityDsl.actions.dishonor({
                    target: this.getTsukeTargets(context)
                }),
                falseGameAction: AbilityDsl.actions.honor({
                    target: this.getTsukeTargets(context)
                })
            }))
        });
    }
    getTsukeTargets(context) {
        let targetedCharacter = context.event.card;
        let targetedCharacterController = context.event.card.controller;

        return targetedCharacterController.cardsInPlay.filter(
            (card) => card.printedCost === targetedCharacter.printedCost
        );
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Ring Effect',
            element: Elements.Fire
        });
        return symbols;
    }
}

IsawaTsuke.id = 'isawa-tsuke';

module.exports = IsawaTsuke;
