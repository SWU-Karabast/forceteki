import { CardTypes, Locations, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class FoothillsKeep extends ProvinceCard {
    static id = 'foothills-keep';

    setupCardAbilities() {
        this.persistentEffect({
            targetLocation: Locations.Provinces,
            targetController: Players.Self,
            condition: () => true,
            match: (card, context) =>
                card.type === CardTypes.Province && card !== context.source && card.controller === context.player,
            effect: AbilityDsl.effects.fateCostToRingToDeclareConflictAgainst()
        });
    }
}
