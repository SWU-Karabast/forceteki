import { Players, CardTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class Ichiro extends DrawCard {
    static id = 'ichiro';

    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Any,
            match: (card) => card.getType() === CardTypes.Character && card.attachments.length > 0,
            effect: [AbilityDsl.effects.cardCannot('honor'), AbilityDsl.effects.cardCannot('dishonor')]
        });
    }
}
