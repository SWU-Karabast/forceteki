import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ItinerantWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7323186775',
            internalName: 'itinerant-warrior',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Use the Force',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Heal 3 damage from a base',
                immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                    amount: 3,
                    target: context.player.base
                }))
            }
        });
    }
}