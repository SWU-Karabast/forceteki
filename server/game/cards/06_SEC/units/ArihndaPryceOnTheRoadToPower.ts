import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ArihndaPryceOnTheRoadToPower extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'arihnda-pryce#on-the-road-to-power-id',
            internalName: 'arihnda-pryce#on-the-road-to-power',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Defeat another friendly unit. If you do, deal 4 damage to each enemy base',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: {
                title: 'Deal 4 damage to each enemy base',
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                    amount: 4,
                    target: context.player.opponent.base
                }))
            }
        });
    }
}
