import { CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class MagistrateStation extends ProvinceCard {
    static id = 'magistrate-station';

    setupCardAbilities() {
        this.action({
            title: 'Ready an honored character',
            canTriggerOutsideConflict: true,
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isHonored,
                gameAction: AbilityDsl.actions.ready()
            }
        });
    }
}
