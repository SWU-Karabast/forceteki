import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class BatteredHaulcraft extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3515403989',
            internalName: 'battered-haulcraft',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to this unit and an enemy space unit',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.damage({ amount: 1 }),
                AbilityHelper.immediateEffects.selectCard({
                    zoneFilter: ZoneName.SpaceArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }),
            ])
        });
    }
}