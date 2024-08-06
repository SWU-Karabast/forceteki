import { Locations, CardTypes } from '../../Constants';
import { PlayCharacterAsIfFromHandIntoConflict } from '../../PlayCharacterAsIfFromHand';
import { PlayDisguisedCharacterAsIfFromHandIntoConflict } from '../../PlayDisguisedCharacterAsIfFromHand';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class GatewayToMeido extends ProvinceCard {
    static id = 'gateway-to-meido';

    public setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isConflictProvince(),
            targetLocation: Locations.DynastyDiscardPile,
            match: (card) => card.type === CardTypes.Character,
            effect: [
                AbilityDsl.effects.gainPlayAction(PlayCharacterAsIfFromHandIntoConflict),
                AbilityDsl.effects.gainPlayAction(PlayDisguisedCharacterAsIfFromHandIntoConflict)
            ]
        });
    }

    public cannotBeStrongholdProvince() {
        return true;
    }
}
