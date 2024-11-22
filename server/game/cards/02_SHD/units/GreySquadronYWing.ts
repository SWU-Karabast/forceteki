import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class GreySquadronYWing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9472541076',
            internalName: 'grey-squadron-ywing',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'An opponent chooses a unit or base they control. You may deal 2 damage to it',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                choosingPlayer: RelativePlayer.Opponent,
                cardCondition: (card, context) => card.isUnit() || card.isBase(),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
            }
        });
    }
}

GreySquadronYWing.implemented = true;
