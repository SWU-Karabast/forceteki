import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GeneralsGuardian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3876951742',
            internalName: 'generals-guardian',
        };
    }

    protected override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Create a Battle Droid token.',
            when: {
                onAttackDeclared: (event, context) => event.attack.target === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}
