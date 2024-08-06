const DrawCard = require('../../drawcard.js');
const { CardTypes, TargetModes, Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const elementKey = 'kuni-yori-earth';

class KuniYori extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: () => this.game.isDuringConflict(this.getCurrentElementSymbol(elementKey)),
            match: card => card.getType() === CardTypes.Character,
            effect: AbilityDsl.effects.modifyBothSkills(1)
        });

        this.action({
            title: 'Select a player to discard a card at random',
            condition: () => this.game.isDuringConflict(),
            cost: AbilityDsl.costs.payHonor(1),
            target: {
                mode: TargetModes.Select,
                activePromptTitle:'Select a player to discard a random card from his/her hand',
                targets: true,
                choices: {
                    [this.owner.name]: AbilityDsl.actions.discardAtRandom({ target: this.owner }),
                    [this.owner.opponent && this.owner.opponent.name || 'NA']: AbilityDsl.actions.discardAtRandom({ target: this.owner.opponent })
                }
            }
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Conflict Type',
            element: Elements.Earth
        });
        return symbols;
    }
}

KuniYori.id = 'kuni-yori';

module.exports = KuniYori;
