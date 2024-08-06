import { Locations, Players, CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class Ninkatoshi extends ProvinceCard {
    static id = 'ninkatoshi';

    setupCardAbilities() {
        this.persistentEffect({
            targetLocation: Locations.Provinces,
            targetController: Players.Self,
            condition: () => true,
            match: (card, context) =>
                card.type === CardTypes.Province && card !== context.source && card.controller === context.player,
            effect: AbilityDsl.effects.modifyProvinceStrength(1)
        });
        this.persistentEffect({
            targetLocation: Locations.Provinces,
            targetController: Players.Opponent,
            condition: () => true,
            match: (card, context) => card.type === CardTypes.Province && card.controller === context.player.opponent,
            effect: AbilityDsl.effects.modifyProvinceStrength(-1)
        });
    }
}
