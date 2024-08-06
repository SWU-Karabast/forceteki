import AbilityDsl from '../../abilitydsl';
import { AbilityTypes, DuelTypes } from '../../Constants';
import DrawCard from '../../drawcard';

export default class TrueStrikeKenjutsu extends DrawCard {
    static id = 'true-strike-kenjutsu';

    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Initiate a military duel',
                initiateDuel: {
                    type: DuelTypes.Military,
                    gameAction: (duel) => AbilityDsl.actions.bow({ target: duel.loser }),
                    statistic: (card) => card.getBaseMilitarySkill()
                },
                printedAbility: false
            })
        });
    }
}
