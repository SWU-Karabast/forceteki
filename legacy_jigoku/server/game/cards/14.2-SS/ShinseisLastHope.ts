import { PlayTypes, Locations, Players, CardTypes, CharacterStatus } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class ShinseisLastHope extends ProvinceCard {
    static id = 'shinsei-s-last-hope';

    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.reduceCost({
                amount: 2,
                match: (card, source) => card.location === source.location,
                playingTypes: PlayTypes.PlayFromProvince
            })
        });

        this.persistentEffect({
            targetLocation: Locations.Provinces,
            targetController: Players.Self,
            match: (card, context) => card.type === CardTypes.Character && card.location === context.source.location,
            effect: AbilityDsl.effects.entersPlayWithStatus(CharacterStatus.Dishonored)
        });
    }
}
