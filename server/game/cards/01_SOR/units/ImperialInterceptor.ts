import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class ImperialInterceptor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9002021213',
            internalName: 'imperial-interceptor'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 3 damage to a space unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: WildcardRelativePlayer.Any,
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            },
            effect: 'deal 3 damage to {1}',
            effectArgs: (context) => [context.target]
        });
    }
}
