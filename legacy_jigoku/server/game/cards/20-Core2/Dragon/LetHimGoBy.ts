import { DuelTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class LetHimGoBy extends DrawCard {
    static id = 'let-him-go-by';

    public setupCardAbilities() {
        this.reaction({
            title: 'Bow a character',
            when: {
                onMoveToConflict: (event, context) =>
                    context.player.opponent && event.card.controller === context.player.opponent,
                onCardPlayed: (event, context) =>
                    context.player.opponent &&
                    event.card.controller === context.player.opponent &&
                    event.card.isParticipating()
            },
            gameAction: AbilityDsl.actions.bow((context) => ({
                target: (context as any).event.card
            }))
        });

        this.action({
            title: 'Challenge a character anywhere to a duel',
            initiateDuel: {
                type: DuelTypes.Military,
                targetCondition: () => true,
                gameAction: (duel) =>
                    AbilityDsl.actions.cardLastingEffect({
                        target: duel.winner,
                        effect: AbilityDsl.effects.modifyMilitarySkill(
                            duel.loser.reduce((total, card) => total + card.getMilitarySkill(), 0)
                        )
                    }),
                message: '{0} gets +{1}{2} skill',
                messageArgs: (duel) => [
                    duel.winner,
                    duel.loser.reduce((total, card) => total + card.getMilitarySkill(), 0),
                    'military'
                ]
            },
            max: AbilityDsl.limit.perConflict(1)
        });
    }
}