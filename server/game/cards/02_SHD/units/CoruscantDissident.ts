import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CoruscantDissident extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9115773123',
            internalName: 'coruscant-dissident'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Ready a resource',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.readyResources((context) => ({
                target: context.player,
                amount: 1
            }))
        });
    }
}
