const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Players, TargetModes, Locations, AbilityTypes } = require('../../Constants');

class BattlefieldOrders extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            location: Locations.Any,
            targetController: Players.Any,
            match: player => player.opponent && player.honor >= player.opponent.honor + 5,
            effect: AbilityDsl.effects.reduceCost({ match: (card, source) => card === source })
        });

        this.action({
            title: 'Resolve an ability',
            condition: context => context.game.isDuringConflict('military'),
            target: {
                activePromptTitle: 'Select an ability to resolve',
                mode: TargetModes.Ability,
                abilityCondition: ability => ability.abilityType === AbilityTypes.Action,
                cardType: CardTypes.Character,
                cardCondition: card => card.isParticipating(),
                controller: Players.Any,
                gameAction: AbilityDsl.actions.resolveAbility(context => ({
                    target: context.targetAbility.card,
                    ability: context.targetAbility,
                    player: context.targetAbility.card.controller,
                    ignoredRequirements: ['player'],
                    choosingPlayerOverride: context.choosingPlayerOverride
                }))
            },
            effect: 'trigger {1}\'s \'{2}\' ability',
            effectArgs: context => [context.targetAbility.card, context.targetAbility.title]
        });
    }
}

BattlefieldOrders.id = 'battlefield-orders';

module.exports = BattlefieldOrders;
