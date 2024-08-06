const DrawCard = require('../../drawcard.js');
const { Durations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class MercenaryCompany extends DrawCard {
    setupCardAbilities() {
        this.forcedReaction({
            title: 'Give control of this character',
            when: {
                afterConflict: (event, context) => context.player.opponent && event.conflict.loser === context.player && context.source.isParticipating()
                    && AbilityDsl.actions.loseFate().canAffect(context.player.opponent, context)
                    && AbilityDsl.actions.placeFate().canAffect(context.source, context)
            },
            gameAction: AbilityDsl.actions.handler({
                handler: context => {
                    context.game.promptWithHandlerMenu(context.player.opponent, {
                        activePromptTitle: 'Place a fate on Mercenary Company to take control of it?',
                        source: context.source,
                        choices: ['Yes', 'No'],
                        handlers: [
                            () => {
                                context.player.opponent.modifyFate(-1);
                                context.source.modifyFate(1);
                                context.source.lastingEffect(() => ({
                                    duration: Durations.Custom,
                                    effect: AbilityDsl.effects.takeControl(context.player.opponent)
                                }));
                                this.game.addMessage('{0} places a fate on and takes control of {1}', context.player.opponent, context.source);
                            },
                            () => {
                                this.game.addMessage('{0} chooses not to hire {1}', context.player.opponent, context.source);
                            }
                        ]
                    });
                }
            }),
            effect: 'let {1} hire their services',
            effectArgs: context => [context.player.opponent],
            limit: AbilityDsl.limit.unlimitedPerConflict()
        });
    }

}

MercenaryCompany.id = 'mercenary-company';

module.exports = MercenaryCompany;
