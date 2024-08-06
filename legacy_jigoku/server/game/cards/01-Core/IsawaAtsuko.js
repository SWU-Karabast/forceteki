const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { Elements } = require('../../Constants');

const elementKey = 'isawa-atsuko-void';

class IsawaAtsuko extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Wield the power of the void',
            condition: () => this.game.isDuringConflict(this.getCurrentElementSymbol(elementKey)),
            effect: 'give friendly characters +1/+1 and opposing characters -1/-1',
            gameAction: [
                AbilityDsl.actions.cardLastingEffect(context => ({
                    target: this.game.currentConflict.getCharacters(context.player),
                    effect: AbilityDsl.effects.modifyBothSkills(1)
                })),
                AbilityDsl.actions.cardLastingEffect(context => ({
                    target: this.game.currentConflict.getCharacters(context.player.opponent),
                    effect: AbilityDsl.effects.modifyBothSkills(-1)
                }))
            ]
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Contested Ring',
            element: Elements.Void
        });
        return symbols;
    }
}

IsawaAtsuko.id = 'isawa-atsuko';

module.exports = IsawaAtsuko;
