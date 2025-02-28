import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, ZoneName } from '../../../core/Constants';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

export default class TranquilityInspiringFlagship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6570091935',
            internalName: 'tranquility#inspiring-flagship',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Return a Republic unit from your discard pile to your hand',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Republic),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });

        this.addOnAttackAbility({
            title: 'Each of the next 3 Republic cards you play this phase costs 1 resource less',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    match: (card) => card.hasSomeTrait(Trait.Republic),
                    limit: AbilityLimit.perGame(3),
                    amount: 1
                })
            })
        });
    }
}
