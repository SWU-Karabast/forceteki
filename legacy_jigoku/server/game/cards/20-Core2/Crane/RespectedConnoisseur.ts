import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class RespectedConnoisseur extends DrawCard {
    static id = 'respected-connoisseur';

    setupCardAbilities() {
        this.action({
            title: 'Honor a character',
            condition: (context) => context.source.isHonored,
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.honor()
            }
        });
    }
}
