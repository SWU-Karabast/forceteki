import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GeneralDravenDoingWhatMustBeDone extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2778554011',
            internalName: 'general-draven#doing-what-must-be-done',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Create an X-Wing token',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
                onCardPlayed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.createXWing()
        });
    }
}
