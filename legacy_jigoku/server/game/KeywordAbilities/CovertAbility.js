const BaseAbility = require('../baseability.js');
const { AbilityTypes } = require('../Constants');

class CovertAbility extends BaseAbility {
    constructor() {
        super({});
        this.title = 'covert';
        this.abilityType = AbilityTypes.KeywordReaction;
    }

    isCardAbility() {
        return true;
    }

    isKeywordAbility() {
        return true;
    }
}

module.exports = CovertAbility;
