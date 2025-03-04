import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';

export default class CorporateDefenseShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4332645242',
            internalName: 'corporate-defense-shuttle',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit can\'t attack',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.cannotAttack()
            ]
        });
    }
}
