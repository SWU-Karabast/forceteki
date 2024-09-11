import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer, WildcardCardType } from '../../core/Constants';

export default class ImperialInterceptor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9002021213',
            internalName: 'imperial-interceptor'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 3 damage to a space unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Any,
                locationFilter: Location.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            },
            effect: 'deal 3 damage to {1}',
            effectArgs: (context) => [context.target]
        });
    }
}

ImperialInterceptor.implemented = true;