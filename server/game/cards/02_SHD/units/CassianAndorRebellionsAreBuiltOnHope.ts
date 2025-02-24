import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PlayType } from '../../../core/Constants';

export default class CassianAndorRebellionsAreBuiltOnHope extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6234506067',
            internalName: 'cassian-andor#rebellions-are-built-on-hope',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Ready this unit.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.playType === PlayType.Smuggle,
                onTrue: AbilityHelper.immediateEffects.ready(),
            })
        });
    }
}
