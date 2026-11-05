import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class SoullessOneSoullessFun extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'soulless-one#soulless-fun-id',
            internalName: 'soulless-one#soulless-fun',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Choose an enemy ground unit. While this unit is in play, the chosen unit gets -3/-0',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.whileSourceInPlayCardEffect({
                    title: 'Gets -3/-0 while this unit is in play',
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: 0 })
                })
            }
        });
    }
}