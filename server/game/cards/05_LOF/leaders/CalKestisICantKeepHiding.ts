import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CalKestisICantKeepHiding extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6677799440',
            internalName: 'cal-kestis#i-cant-keep-hiding',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'An opponent chooses a ready unit they control. Exhaust that unit',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.useTheForce()],
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.canBeExhausted() && !card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'An opponent chooses a ready unit they control. Exhaust that unit',
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.canBeExhausted() && !card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
        });
    }
}
