const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Durations } = require('../../Constants');

class StudyTheNaturalWorld extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Add elements to the conflict ring',
            condition: context => context.player.anyCardsInPlay(card => card.isAttacking() && card.hasTrait('scholar')),
            effect: 'add {1} to the conflict ring. They may resolve all elements if they win the conflict',
            effectArgs: context => [this.getElements(context)],
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.ringLastingEffect(context => ({
                    duration: Durations.UntilEndOfConflict,
                    target: context.game.currentConflict.ring,
                    effect: AbilityDsl.effects.addElement(this.getElementsOfAttackedProvinces(context))
                })),
                AbilityDsl.actions.playerLastingEffect(context => ({
                    targetController: context.player,
                    effect: AbilityDsl.effects.delayedEffect({
                        when: {
                            afterConflict: event =>
                                context.player === event.conflict.winner
                        },
                        gameAction: AbilityDsl.actions.menuPrompt({
                            activePromptTitle: 'Resolve Ring Effects?',
                            choices: ['Yes', 'No'],
                            choiceHandler: (choice, displayMessage) => {
                                if(displayMessage && choice === 'Yes') {
                                    context.game.addMessage('{0} chooses to resolve all elements of the contested ring due to the delayed effect of {1}', context.player, context.source);
                                }
                                return { target: (choice === 'Yes' ? context.game.currentConflict.ring.getElements() : []) };
                            },
                            gameAction: AbilityDsl.actions.resolveRingEffect()
                        })
                    })
                }))
            ])
        });
    }

    getElementsOfAttackedProvinces(context) {
        let elements = [];
        context.game.currentConflict.getConflictProvinces().forEach(a => {
            elements = elements.concat(a.getElement());
        });
        return elements;
    }

    getElements(context) {
        const capitalize = {
            air: 'Air',
            water: 'Water',
            earth: 'Earth',
            fire: 'Fire',
            void: 'Void'
        };

        let string = '';
        let elements = this.getElementsOfAttackedProvinces(context);
        for(let i = 0; i < elements.length; i++) {
            if(i !== 0) {
                if(i === elements.length - 1) {
                    string += ' and ';
                } else {
                    string += ', ';
                }
            }
            string += capitalize[elements[i]];
        }

        return string;
    }
}

StudyTheNaturalWorld.id = 'study-the-natural-world';

module.exports = StudyTheNaturalWorld;
