const DrawCard = require('../../drawcard.js');
const { Durations, Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

const elementKey = 'isawa-pilgrim-water';

class IsawaPilgrim extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give control of this character',
            effect: 'give control of itself to {1}',
            effectArgs: context => [context.player.opponent],
            condition: context => context.player.opponent && context.game.rings[this.getCurrentElementSymbol(elementKey)].isConsideredClaimed(context.player.opponent),
            gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                effect: AbilityDsl.effects.takeControl(context.player.opponent),
                duration: Durations.Custom
            }))
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Claimed Ring',
            element: Elements.Water
        });
        return symbols;
    }
}

IsawaPilgrim.id = 'isawa-pilgrim';

module.exports = IsawaPilgrim;
