const DrawCard = require('../../drawcard.js');
const { CardTypes, Players, Phases, Locations, TargetModes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class Reconnaissance extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Look at provinces',
            when: {
                onPhaseStarted: event => event.phase === Phases.Conflict
            },
            effect: 'look at 3 provinces',
            target: {
                mode: TargetModes.UpTo,
                numCards: 3,
                activePromptTitle: 'Choose up to 3 provinces',
                location: Locations.Provinces,
                cardType: CardTypes.Province,
                controller: Players.Any,
                gameAction: AbilityDsl.actions.conditional({
                    condition: context => context.player.opponent && context.player.honor >= context.player.opponent.honor + 5,
                    trueGameAction: AbilityDsl.actions.sequential([
                        this.getLookAtAction(),
                        AbilityDsl.actions.selectCard(context => {
                            let target = context.target;
                            if(!Array.isArray(target)) {
                                target = [target];
                            }
                            const locations = target.map(a => a.location);
                            return ({
                                activePromptTitle: 'Choose cards to discard',
                                mode: TargetModes.Unlimited,
                                optional: true,
                                cardType: [CardTypes.Character, CardTypes.Event, CardTypes.Holding],
                                location: [Locations.Provinces],
                                controller: Players.Any,
                                cardCondition: card => locations.includes(card.location),
                                message: '{0} chooses to discard {1}',
                                messageArgs: cards => [context.player, cards],
                                gameAction: AbilityDsl.actions.moveCard({ destination: Locations.DynastyDiscardPile })
                            });
                        })
                    ]),
                    falseGameAction: this.getLookAtAction()
                })
            }
        });
    }

    getLookAtAction() {
        return AbilityDsl.actions.lookAt(context => ({
            message: context => {
                let target = context.target;
                if(!Array.isArray(target)) {
                    target = [target];
                }

                if(target.length === 1) {
                    return '{0} sees {1} in {2}';
                } else if(target.length === 2) {
                    return '{0} sees {1} in {2} and {3} in {4}';
                }
                return '{0} sees {1} in {2}, {3} in {4}, and {5} in {6}';

            },
            messageArgs: () => {
                let target = context.target;
                if(!Array.isArray(target)) {
                    target = [target];
                }

                if(target.length === 1) {
                    return [context.source, target[0], target[0].location];
                } else if(target.length === 2) {
                    return [context.source, target[0], target[0].location, target[1], target[1].location];
                }
                return [context.source, target[0], target[0].location, target[1], target[1].location, target[2], target[2].location];

            }
        }));
    }
}

Reconnaissance.id = 'reconnaissance';

module.exports = Reconnaissance;
