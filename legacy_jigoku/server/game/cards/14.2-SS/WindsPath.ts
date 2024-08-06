import { CardTypes, Locations } from '../../Constants';
import { PlayCharacterAsIfFromHandIntoConflict } from '../../PlayCharacterAsIfFromHand';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class WindsPath extends ProvinceCard {
    static id = 'wind-s-path';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.game.isDuringConflict(),
            targetLocation: Locations.Provinces,
            match: (card, context) =>
                card.type === CardTypes.Character && card.location === context.source.location && card.isFaceup(),
            effect: [AbilityDsl.effects.gainPlayAction(PlayCharacterAsIfFromHandIntoConflict)]
        });
    }
}
