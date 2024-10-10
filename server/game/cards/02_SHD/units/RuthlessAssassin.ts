import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class RuthlessAssassin extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3803148745',
            internalName: 'ruthless-assassin'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to each other ground unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}

RuthlessAssassin.implemented = true;
