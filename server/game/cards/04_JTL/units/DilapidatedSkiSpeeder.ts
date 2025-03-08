import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DilapidatedSkiSpeeder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5012301077',
            internalName: 'dilapidated-ski-speeder'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 3 damage to this unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                target: context.source,
                amount: 3,
            }))
        });
    }
}