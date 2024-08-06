const DrawCard = require('../../../drawcard.js');
const { TargetModes, CardTypes, AbilityTypes, Durations } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');
const { GameModes } = require('../../../../GameModes.js');

class CraftyTsukumogami extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Attach to a ring',
            target: {
                mode: TargetModes.Ring,
                activePromptTitle: 'Choose a ring to attach to',
                ringCondition: (ring, context) => this.checkRingCondition(ring, context),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.cardLastingEffect(context => ({
                        canChangeZoneOnce: true,
                        duration: Durations.Custom,
                        target: context.source,
                        effect: [
                            AbilityDsl.effects.changeType(CardTypes.Attachment),
                            AbilityDsl.effects.gainAbility(AbilityTypes.ForcedReaction, {
                                title: 'Discard a card',
                                limit: AbilityDsl.limit.unlimitedPerConflict(),
                                when: {
                                    onConflictDeclared: (event, context) => context.source.parent && context.source.parent === event.ring
                                },
                                printedAbility: false,
                                gameAction: AbilityDsl.actions.chosenDiscard(context => ({
                                    target: context.game.currentConflict.attackingPlayer,
                                    amount: 1
                                }))
                            })
                        ]
                    })),
                    AbilityDsl.actions.attachToRing(context => ({
                        attachment: context.source
                    })),
                    AbilityDsl.actions.handler({
                        handler: context => {
                            const card = context.source;
                            card.controller.cardsInPlay.splice(card.controller.cardsInPlay.indexOf(card), 1);
                            if(context.game.isDuringConflict()) {
                                context.game.currentConflict.removeFromConflict(card);
                            }
                        }
                    })
                ])
            },
            effect: 'attach itself to the {0}'
        });
    }

    checkRingCondition(ring, context) {
        const frameworkLimitsAttachmentsWithRepeatedNames = context.game.gameMode === GameModes.Emerald || context.game.gameMode === GameModes.Obsidian;
        if(frameworkLimitsAttachmentsWithRepeatedNames) {
            const attachment = context.source;
            if(ring.attachments.filter(a => !a.allowDuplicatesOfAttachment).some(a => a.id === attachment.id && a.controller === attachment.controller && a !== attachment)) {
                return false;
            }
        }
        return true;
    }

    canAttach(ring) {
        return ring && ring.type === 'ring' && this.getType() === CardTypes.Attachment;
    }
    canPlayOn(source) {
        return source && source.getType() === 'ring' && this.getType() === CardTypes.Attachment;
    }
    mustAttachToRing() {
        return this.getType() === CardTypes.Attachment;
    }
}

CraftyTsukumogami.id = 'crafty-tsukumogami';
module.exports = CraftyTsukumogami;
