import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { Duel } from '../../../Duel';

export default class Coward extends DrawCard {
    static id = 'coward-';

    public setupCardAbilities() {
        this.duelChallenge({
            title: 'Dishonor a character',
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                activePromptTitle: 'Choose a duel participant',
                cardType: CardTypes.Character,
                controller: Players.Any,
                hidePromptIfSingleCard: true,
                cardCondition: (card: DrawCard) => {
                    const duel: Duel = (context as any).event.duel;
                    const isInvolved = duel.isInvolved(card);
                    const isChallenger = duel.challenger === card;
                    const higherSkill = duel.targets.some(
                        (target) => duel.getSkillStatistic(card) > duel.getSkillStatistic(target)
                    );

                    return isInvolved && isChallenger && higherSkill;
                },
                message: '{0} dishonors {1}',
                messageArgs: (cards) => [context.player, cards],
                gameAction: AbilityDsl.actions.dishonor()
            })),
            effect: 'dishonor a duel challenger'
        });

        this.reaction({
            title: 'Dishonor a character',
            when: {
                onConflictPass: (event, context) => event.conflict.attackingPlayer === context.player.opponent
            },
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                gameAction: AbilityDsl.actions.dishonor()
            }
        });
    }
}
