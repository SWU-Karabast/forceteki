const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { TargetModes, CardTypes, Locations } = require('../../Constants');

class CountrysideTrader extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Resolve the attacked province ability',
            cost: AbilityDsl.costs.payFate(1),
            condition: context => context.game.isDuringConflict() && context.source.isAttacking(),
            target: {
                activePromptTitle: 'Select a province to trigger from',
                mode: TargetModes.Ability,
                location: Locations.Provinces,
                cardType: CardTypes.Province,
                cardCondition: card => card.isConflictProvince(),
                abilityCondition: ability => ability.printedAbility,
                gameAction: AbilityDsl.actions.resolveAbility(context => ({
                    target: context.targetAbility.card,
                    ability: context.targetAbility,
                    player: context.player,
                    ignoredRequirements: ['condition'],
                    choosingPlayerOverride: context.choosingPlayerOverride
                }))
            }
        });
    }
}

CountrysideTrader.id = 'countryside-trader';

module.exports = CountrysideTrader;
