import { CardTypes, Durations, Locations, Players, TargetModes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class BayushiKotaro extends DrawCard {
    static id = 'bayushi-kotaro';

    setupCardAbilities() {
        this.action({
            title: 'Put a character into play',
            condition: (context) => context.source.isParticipating(),
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.reveal((context) => ({
                    target: context.player.getDynastyCardsInProvince(Locations.Provinces)
                })),
                AbilityDsl.actions.selectCard((context) => ({
                    activePromptTitle: 'Choose a character to put into the conflict',
                    numCards: 1,
                    targets: true,
                    mode: TargetModes.Exactly,
                    optional: false,
                    cardType: CardTypes.Character,
                    location: [Locations.Provinces],
                    controller: Players.Self,
                    cardCondition: (card) =>
                        !card.facedown &&
                        card.isFaction('scorpion') &&
                        card.allowGameAction('putIntoConflict', context),
                    message: '{0} puts {1} into play into the conflict, aiding {2} with their mission.',
                    messageArgs: (card) => [context.player, card, context.source],
                    subActionProperties: (card) => ({ target: card, x: 11 }),
                    gameAction: AbilityDsl.actions.sequential([
                        AbilityDsl.actions.putIntoConflict(),
                        AbilityDsl.actions.cardLastingEffect(() => ({
                            duration: Durations.UntilEndOfPhase,
                            location: [Locations.PlayArea],
                            effect: AbilityDsl.effects.delayedEffect({
                                when: { onConflictFinished: () => true },
                                gameAction: AbilityDsl.actions.returnToDeck({ bottom: true })
                            })
                        }))
                    ])
                }))
            ])
        });
    }
}