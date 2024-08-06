import { Players, CardTypes } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import { BattlefieldAttachment } from '../BattlefieldAttachment';

export default class MakeshiftWarCamp extends BattlefieldAttachment {
    static id = 'makeshift-war-camp';

    public setupCardAbilities() {
        super.setupCardAbilities();

        this.persistentEffect({
            condition: (context) =>
                context.source.parent && context.game.isDuringConflict() && context.source.parent.isConflictProvince(),
            targetController: Players.Self,
            match: (card) => card.isParticipating() && card.type === CardTypes.Character,
            effect: AbilityDsl.effects.modifyMilitarySkill(2)
        });
    }
}
