import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class BurnishedReputation extends DrawCard {
    static id = 'burnished-reputation';

    setupCardAbilities() {
        this.action({
            title: 'Honor a participating character',
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.honor()
            }
        });
    }
}
