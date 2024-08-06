import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class EminentHistorian extends DrawCard {
    static id = 'eminent-historian';

    setupCardAbilities() {
        this.action({
            title: 'Honor a character',
            condition: (context) => context.source.isParticipating() && context.player.isMoreHonorable(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.honor()
            }
        });
    }
}
