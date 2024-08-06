import { CardTypes, DuelTypes, Players } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class MirumotoRaitsugu extends DrawCard {
    static id = 'mirumoto-raitsugu';

    setupCardAbilities() {
        this.action({
            title: 'Duel an opposing character',
            condition: (context) => context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.duel((context) => ({
                    type: DuelTypes.Military,
                    challenger: context.source,
                    gameAction: (duel) =>
                        AbilityDsl.actions.conditional({
                            target: duel.loser?.[0],
                            condition: duel.loser?.[0]?.getFate() > 0,
                            trueGameAction: AbilityDsl.actions.removeFate(),
                            falseGameAction: AbilityDsl.actions.discardFromPlay()
                        })
                }))
            }
        });
    }
}
