import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class BrainInvaders extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4602353389',
            internalName: 'brain-invaders',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'Each leader loses all abilities (except Epic Actions) and cannot gain abilities',
            targetZoneFilter: WildcardZoneName.Any,
            targetController: WildcardRelativePlayer.Any,
            targetCardTypeFilter: WildcardCardType.Any,
            matchTarget: (card) => card.isLeader(),
            ongoingEffect: AbilityHelper.ongoingEffects.loseAllAbilities()
        });
    }
}
