import { AbilityContext } from '../../../AbilityContext';
import { CardTypes, Decks, Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import BaseCard from '../../../basecard';
import DrawCard from '../../../drawcard';

const selectAttachmentPrompt = 'Select an attachment';

function isSearchableCard(card: BaseCard, context: AbilityContext) {
    return (
        card.type === CardTypes.Attachment &&
        (card.hasTrait('title') || card.hasTrait('technique')) &&
        card.canAttach(context.source)
    );
}

export default class KitsukiMasanori extends DrawCard {
    static id = 'kitsuki-masanori';

    public setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot({ cannot: 'applyCovert', restricts: 'opponentsCardEffects' })
        });

        this.reaction({
            title: 'Search for a Title or Technique',
            when: { onCharacterEntersPlay: (event, context) => event.card === context.source },
            effect: 'search for a Technique or Title',
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.chooseAction({
                    activePromptTitle: 'Select where to search',
                    options: {
                        'Search discard pile': {
                            action: AbilityDsl.actions.cardMenu((context) => ({
                                activePromptTitle: selectAttachmentPrompt,
                                cards: context.player.conflictDiscardPile.filter((card: BaseCard) =>
                                    isSearchableCard(card, context)
                                ),
                                subActionProperties: (card) => ({
                                    attachment: card,
                                    target: context.source,
                                    bisteca: 33
                                }),
                                gameAction: AbilityDsl.actions.attach(),
                                message: '{0} takes {1} and attaches it to {2}',
                                messageArgs: (card) => [context.source.controller, card, context.source]
                            })),
                            message: '{0} searches their discard pile'
                        },

                        'Search conflict deck': {
                            action: AbilityDsl.actions.deckSearch({
                                activePromptTitle: selectAttachmentPrompt,
                                deck: Decks.ConflictDeck,
                                reveal: true,
                                cardCondition: (card, context) => isSearchableCard(card, context),
                                selectedCardsHandler: (context, event, cards) => {
                                    const card = cards[0];
                                    if (!card) {
                                        return;
                                    }

                                    context.game.addMessage(
                                        '{0} takes {1} and attaches it to {2}',
                                        event.player,
                                        card,
                                        context.source
                                    );
                                    context.game.queueSimpleStep(() =>
                                        AbilityDsl.actions
                                            .attach({ target: context.source, attachment: card })
                                            .resolve(null, context)
                                    );
                                }
                            }),
                            message: '{0} searches their conflict deck'
                        }
                    }
                }),
                AbilityDsl.actions.cardLastingEffect((context) => {
                    const [fetchedAttachment] = context.source.attachments;
                    return {
                        target: fetchedAttachment,
                        condition: (context) => fetchedAttachment.parent === context.source,
                        duration: Durations.Custom,
                        effect: AbilityDsl.effects.cardCannot({
                            cannot: 'target',
                            restricts: 'opponentsCardAbilities',
                            applyingPlayer: context.player
                        })
                    };
                })
            ])
        });
    }
}
