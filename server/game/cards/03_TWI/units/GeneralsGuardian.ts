import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GeneralsGuardian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3876951742',
            internalName: 'generals-guardian',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Create a Battle Droid token.',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}
