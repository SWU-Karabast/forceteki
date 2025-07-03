import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChewbaccaLoyalCompanion extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8918765832',
            internalName: 'chewbacca#loyal-companion',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Ready Chewbacca',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source)
            },
            immediateEffect: AbilityHelper.immediateEffects.ready()
        });
    }
}
