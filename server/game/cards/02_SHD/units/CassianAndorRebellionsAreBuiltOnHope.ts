import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CassianAndorRebellionsAreBuiltOnHope extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6234506067',
            internalName: 'cassian-andor#rebellions-are-built-on-hope',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Ready this unit',
            when: {
                whenPlayedUsingSmuggle: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.ready(),
        });
    }
}
