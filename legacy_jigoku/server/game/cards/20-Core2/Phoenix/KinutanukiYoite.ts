import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class KinutanukiYoite extends DrawCard {
    static id = 'kinutanuki-yoite';

    setupCardAbilities() {
        this.reaction({
            title: 'Discard an enemy character',
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player &&
                    context.source.isParticipating() &&
                    (event.card as DrawCard).hasEveryTrait('fire', 'spell')
            },
            target: {
                activePromptTitle: 'Choose a character',
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card: DrawCard, context) =>
                    card.isParticipating() && card.militarySkill <= (context.source as DrawCard).militarySkill,
                gameAction: AbilityDsl.actions.conditional({
                    condition: (context) => context.target.getFate() === 0,
                    trueGameAction: AbilityDsl.actions.discardFromPlay(),
                    falseGameAction: AbilityDsl.actions.removeFate()
                })
            }
        });
    }
}
