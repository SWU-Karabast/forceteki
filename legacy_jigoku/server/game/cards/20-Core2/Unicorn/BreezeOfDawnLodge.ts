import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import type DrawCard from '../../../drawcard';
import { StrongholdCard } from '../../../StrongholdCard';

export default class BreezeOfDawnLodge extends StrongholdCard {
    static id = 'breeze-of-dawn-lodge';

    stealFirstPlayerDuringSetupWithMsg = '{0} takes the first player token. The speed of Lady Shinjo!';

    setupCardAbilities() {
        this.action({
            title: 'Move a character into or out of the conflict',
            cost: AbilityDsl.costs.bowSelf(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card: DrawCard) => !card.bowed,
                gameAction: AbilityDsl.actions.conditional(({ target }) => ({
                    condition: () => target.isParticipating(),
                    trueGameAction: AbilityDsl.actions.sendHome({ target }),
                    falseGameAction: AbilityDsl.actions.moveToConflict({ target })
                }))
            }
        });
    }
}
