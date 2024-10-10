import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class GreySquadronYWing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9472541076',
            internalName: 'grey-squadron-ywing'
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Deal 2 damage to a ground unit if Koska Reeves is upgraded',
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.damage({ optional: true, amount: 2 })
            },
        });
    }
}

GreySquadronYWing.implemented = true;
