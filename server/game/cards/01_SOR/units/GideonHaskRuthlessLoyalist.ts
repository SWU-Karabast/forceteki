import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';
import * as EnumHelpers from '../../../core/utils/EnumHelpers.js';

export default class GideonHaskRuthlessLoyalist extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1664771721',
            internalName: 'gideon-hask#ruthless-loyalist'
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Give an Experience token to a friendly unit',
            when: {
                onCardDefeated: (event, context) => EnumHelpers.isUnit(event.lastKnownInformation.type) && event.card.controller !== context.player
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
