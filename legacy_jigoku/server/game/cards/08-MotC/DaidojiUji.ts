import { Locations } from '../../Constants';
import { PlayCharacterAsIfFromHand } from '../../PlayCharacterAsIfFromHand';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class DaidojiUji extends DrawCard {
    static id = 'daidoji-uji';

    public setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isHonored,
            targetLocation: Locations.Provinces,
            match: (card) => card.isDynasty && card.isFaceup(),
            effect: AbilityDsl.effects.gainPlayAction(PlayCharacterAsIfFromHand)
        });
    }
}
