import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class ItinerantWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7323186775',
            internalName: 'itinerant-warrior',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Use the Force to heal 3 damage from a base',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Heal 3 damage from a base',
                targetResolver: {
                    cardTypeFilter: CardType.Base,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 })
                }
            }
        });
    }
}