import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GeneralDravenDoingWhatMustBeDone extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2778554011',
            internalName: 'general-draven#doing-what-must-be-done',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Create an X-Wing token',
            when: {
                onAttack: true,
                whenPlayed: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.createXWing()
        });
    }
}
