import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

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
                onCardDefeated: (event, context) => event.card.isUnit() && event.card.controller !== context.source.controller
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
