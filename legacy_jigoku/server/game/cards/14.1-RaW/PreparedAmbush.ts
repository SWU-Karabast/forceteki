import { Locations } from '../../Constants';
import { PlayCharacterAsIfFromHandIntoConflict } from '../../PlayCharacterAsIfFromHand';
import AbilityDsl = require('../../abilitydsl');
import { BattlefieldAttachment } from '../BattlefieldAttachment';

export default class PreparedAmbush extends BattlefieldAttachment {
    static id = 'prepared-ambush';

    public setupCardAbilities() {
        super.setupCardAbilities();

        this.persistentEffect({
            condition: (context) =>
                context.source.parent && context.game.isDuringConflict() && context.source.parent.isConflictProvince(),
            targetLocation: Locations.Provinces,
            match: (card) => card.isDynasty && card.isFaceup(),
            effect: AbilityDsl.effects.gainPlayAction(PlayCharacterAsIfFromHandIntoConflict)
        });
    }
}
