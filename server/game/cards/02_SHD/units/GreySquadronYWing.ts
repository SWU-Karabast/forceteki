import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

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
                cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
            },
            then: (context) => ({
                title: `Deal 2 damage to ${context.target.title}`,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    target: context.target,
                    amount: 2,
                }),
            })
        });
    }
}
