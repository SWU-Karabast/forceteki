import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class ProtectThePod extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'protect-the-pod-id',
            internalName: 'protect-the-pod',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'A friendly non-Vehicle unit deals damage equal to its remaining HP to an enemy unit',
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle)
                },
                enemyUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: context.targets.friendlyUnit.remainingHp,
                        source: context.targets.friendlyUnit
                    })),
                }
            }
        });
    }
}
