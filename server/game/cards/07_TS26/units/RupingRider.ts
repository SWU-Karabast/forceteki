import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class RupingRider extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ruping-rider-id',
            internalName: 'ruping-rider',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to a base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.base.damage >= 15,
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 })
                })
            }
        });
    }
}
