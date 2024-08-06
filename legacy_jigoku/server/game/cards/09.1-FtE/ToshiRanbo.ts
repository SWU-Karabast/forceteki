import { Locations } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class ToshiRanbo extends ProvinceCard {
    static id = 'toshi-ranbo';

    setupCardAbilities() {
        this.facedown = false;

        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot('turnFacedown')
        });

        this.persistentEffect({
            targetLocation: Locations.Provinces,
            match: (card, context) => card.isDynasty && card.location === context.source.location,
            effect: AbilityDsl.effects.gainExtraFateWhenPlayed()
        });
    }

    cannotBeStrongholdProvince() {
        return true;
    }

    startsGameFaceup() {
        return true;
    }
}
