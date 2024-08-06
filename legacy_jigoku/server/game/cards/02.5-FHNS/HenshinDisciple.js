const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Elements } = require('../../Constants');

const elementKeys = {
    air: 'hallowed-ground-air',
    earth: 'hallowed-ground-earth',
    fire: 'hallowed-ground-fire'
};

class HenshinDisciple extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context =>
                this.game.rings[this.getCurrentElementSymbol(elementKeys.air)].isConsideredClaimed(context.player) ||
                (this.game.isDuringConflict(this.getCurrentElementSymbol(elementKeys.air)) && this.game.currentConflict.ring.isContested()),
            effect: AbilityDsl.effects.modifyPoliticalSkill(2)
        });
        this.persistentEffect({
            condition: context =>
                this.game.rings[this.getCurrentElementSymbol(elementKeys.earth)].isConsideredClaimed(context.player) ||
                (this.game.isDuringConflict(this.getCurrentElementSymbol(elementKeys.earth)) && this.game.currentConflict.ring.isContested()),
            effect: AbilityDsl.effects.modifyMilitarySkill(2)
        });
        this.persistentEffect({
            condition: context =>
                this.game.rings[this.getCurrentElementSymbol(elementKeys.fire)].isConsideredClaimed(context.player) ||
                (this.game.isDuringConflict(this.getCurrentElementSymbol(elementKeys.fire)) && this.game.currentConflict.ring.isContested()),
            effect: AbilityDsl.effects.addKeyword('pride')
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKeys.air,
            prettyName: '+2 Political',
            element: Elements.Air
        });
        symbols.push({
            key: elementKeys.earth,
            prettyName: '+2 Military',
            element: Elements.Earth
        });
        symbols.push({
            key: elementKeys.fire,
            prettyName: 'Pride',
            element: Elements.Fire
        });
        return symbols;
    }
}

HenshinDisciple.id = 'henshin-disciple';

module.exports = HenshinDisciple;
