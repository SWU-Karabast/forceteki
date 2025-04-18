import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PrivateerCrew extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2288926269',
            internalName: 'privateer-crew',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Give 3 experience tokens to this unit',
            when: {
                whenPlayedUsingSmuggle: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                amount: 3,
                target: context.source
            })),
        });
    }
}
