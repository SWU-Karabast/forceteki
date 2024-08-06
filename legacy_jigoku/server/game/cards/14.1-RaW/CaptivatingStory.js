const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Players } = require('../../Constants');
const CardAbility = require('../../CardAbility');

class CaptivatingStory extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give a character +X pol',
            condition: context => context.game.isDuringConflict() && this.game.currentConflict.getNumberOfParticipantsFor(context.player) === 1,
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card, context) => card.isParticipating() && (context.player.getNumberOfFaceupProvinces() > 0 || card.allowGameAction('removeFate', context)),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.cardLastingEffect(context => ({
                        effect: AbilityDsl.effects.modifyPoliticalSkill(context.player.getNumberOfFaceupProvinces())
                    })),
                    AbilityDsl.actions.menuPrompt(context => ({
                        activePromptTitle: 'Remove 1 fate from ' + context.target.name + ' to honor them?',
                        choices: ['Yes'].concat(context.player.getNumberOfFaceupProvinces() > 0 ? ['No'] : []),
                        choiceHandler: (choice, displayMessage) => {
                            if(displayMessage) {
                                context.game.addMessage('{0} chooses {1}to remove a fate from {2} to honor them', context.player, choice === 'No' ? 'not ' : '', context.target);
                            }
                            return { amount: choice === 'Yes' ? 1 : 0 };
                        },
                        gameAction: AbilityDsl.actions.joint([
                            AbilityDsl.actions.removeFate(context => ({
                                target: context.target
                            })),
                            AbilityDsl.actions.resolveAbility({
                                target: context.source,
                                subResolution: true,
                                ability: new CardAbility(this.game, context.source, {
                                    title: 'Honor this character',
                                    gameAction: AbilityDsl.actions.honor({ target: context.target })
                                })
                            })
                        ])
                    }))
                ])
            },
            effect: 'give {0} +1{1} for each faceup province they control (+{2}{1})',
            effectArgs: context => ['political', context.player.getNumberOfFaceupProvinces()]
        });
    }
}

CaptivatingStory.id = 'captivating-story';

module.exports = CaptivatingStory;
