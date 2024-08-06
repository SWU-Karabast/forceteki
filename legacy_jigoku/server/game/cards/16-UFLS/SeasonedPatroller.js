const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Players, Locations } = require('../../Constants');

class SeasonedPatroller extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            match: card => card.isConflictProvince(),
            targetLocation: Locations.Provinces,
            targetController: Players.Any,
            condition: context => context.source.isAttacking(),
            effect: [
                AbilityDsl.effects.suppressEffects(effect =>
                    effect.isProvinceStrengthModifier() && effect.getValue() > 0
                ),
                AbilityDsl.effects.provinceCannotHaveSkillIncreased(),
                AbilityDsl.effects.cannotApplyLastingEffects(effect =>
                    effect.isProvinceStrengthModifier() && effect.getValue() > 0
                )
            ]
        });
    }
}

SeasonedPatroller.id = 'seasoned-patroller';

module.exports = SeasonedPatroller;
