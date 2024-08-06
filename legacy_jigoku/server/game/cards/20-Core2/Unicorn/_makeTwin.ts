import AbilityDsl from '../../../abilitydsl';
import { Decks, Durations } from '../../../Constants';
import DrawCard from '../../../drawcard';

export function makeTwin(id: string, opt: { siblingName: string; title: string; effect: string }) {
    return class Twin extends DrawCard {
        static id = id;

        setupCardAbilities() {
            this.action({
                title: opt.title,
                effect: opt.effect,
                gameAction: AbilityDsl.actions.deckSearch({
                    cardCondition: (card) => card.name === opt.siblingName,
                    deck: Decks.DynastyDeck,
                    shuffle: false,
                    activePromptTitle: `Find a copy of ${opt.siblingName}`,
                    selectedCardsHandler: (context, event, cards) => {
                        if (cards.length === 0) {
                            context.game.addMessage(`{0} finds no copies of ${opt.siblingName}`, event.player);
                            return;
                        }

                        const newCharacter = cards[0];
                        const replacedCharacter = context.source as DrawCard;
                        const intoPlayAction = replacedCharacter.isParticipating()
                            ? AbilityDsl.actions.putIntoConflict({ target: newCharacter })
                            : AbilityDsl.actions.putIntoPlay({ target: newCharacter });
                        intoPlayAction.resolve(newCharacter, context);

                        const sequence = replacedCharacter.attachments.map((attachment) =>
                            AbilityDsl.actions.ifAble({
                                ifAbleAction: AbilityDsl.actions.attach({ attachment, target: newCharacter }),
                                otherwiseAction: AbilityDsl.actions.discardFromPlay({ target: attachment })
                            })
                        );
                        sequence.push(
                            AbilityDsl.actions.placeFate({
                                target: newCharacter,
                                origin: replacedCharacter,
                                amount: replacedCharacter.fate
                            })
                        );
                        for (const token of replacedCharacter.statusTokens) {
                            sequence.push(
                                AbilityDsl.actions.moveStatusToken({ target: token, recipient: newCharacter })
                            );
                        }
                        AbilityDsl.actions.sequential(sequence).resolve(newCharacter, context);

                        AbilityDsl.actions
                            .cardLastingEffect({
                                effect: AbilityDsl.effects.blank(),
                                duration: Durations.UntilEndOfRound,
                                target: newCharacter
                            })
                            .resolve(newCharacter, context);

                        AbilityDsl.actions
                            .returnToDeck({ target: replacedCharacter, shuffle: true })
                            .resolve(replacedCharacter, context);

                        context.game.addMessage(
                            '{0} replaces {1} with {2}',
                            event.player,
                            replacedCharacter,
                            newCharacter
                        );
                    }
                })
            });
        }
    };
}