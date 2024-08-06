import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { Conflict } from '../../../conflict';

const ORIGINAL = 'original';
const CLONE = 'clone';

export default class TwoHands extends DrawCard {
    static id = 'two-hands';

    setupCardAbilities() {
        this.duelChallenge({
            title: 'Add a character to the duel',
            duelCondition: (duel, context) => duel.challengingPlayer === context.player,
            target: {
                controller: Players.Opponent,
                gameAction: AbilityDsl.actions.duelAddParticipant((context) => ({
                    duel: (context as any).event.duel
                }))
            }
        });

        this.action({
            title: 'Set the skill of one enemy character equal to another enemy character',
            condition: (context) =>
                context.game.currentConflict instanceof Conflict &&
                context.player.cardsInPlay.some(
                    (card: DrawCard) =>
                        card.isParticipating() && card.attachments.some((attachment) => attachment.hasTrait('weapon'))
                ) &&
                context.game.currentConflict.getNumberOfParticipantsFor(context.player.opponent) >
                    context.game.currentConflict.getNumberOfParticipantsFor(context.player),
            targets: {
                [ORIGINAL]: {
                    activePromptTitle: 'Choose the character that will remain unchanged',
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    cardCondition: (card) => card.isParticipating()
                },
                [CLONE]: {
                    dependsOn: ORIGINAL,
                    activePromptTitle: 'Choose the character to that will have their skills changed',
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    cardCondition: (card, context) => card !== context.targets[ORIGINAL] && card.isParticipating(),
                    gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                        effect: [
                            AbilityDsl.effects.setMilitarySkill(
                                (context.targets[ORIGINAL] as DrawCard).getMilitarySkill()
                            ),
                            AbilityDsl.effects.setPoliticalSkill(
                                (context.targets[ORIGINAL] as DrawCard).getPoliticalSkill()
                            )
                        ]
                    }))
                }
            },
            effect: 'set {1} {3} and {4} skills equal to {2}',
            effectArgs: (context) => [context.targets[CLONE], context.targets[ORIGINAL], 'military', 'political']
        });
    }
}