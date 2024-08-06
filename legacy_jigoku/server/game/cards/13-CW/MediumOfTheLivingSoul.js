const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Players, AbilityTypes } = require('../../Constants');

class MediumOfTheLivingSoul extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Grant an ability to resolve ring effects',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    effect: AbilityDsl.effects.gainAbility(AbilityTypes.Reaction, {
                        title: 'Resolve the Ring Effect',
                        when: {
                            onResolveRingElement: (event, context) => {
                                let val = event.player === context.player && context.source.isParticipating();
                                return val;
                            }
                        },
                        cost: AbilityDsl.costs.removeFateFromSelf(),
                        // @ts-ignore
                        gameAction: AbilityDsl.actions.resolveRingEffect((context) => ({ target: context.event.ring }))
                    })
                }))
            },
            effect: 'give {0} the ability to resolve a ring effect'
        });
    }
}

MediumOfTheLivingSoul.id = 'medium-of-the-living-soul';

module.exports = MediumOfTheLivingSoul;
