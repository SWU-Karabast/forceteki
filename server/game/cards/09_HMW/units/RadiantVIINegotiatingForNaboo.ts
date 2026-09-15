import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RadiantVIINegotiatingForNaboo extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'radiant-vii#negotiating-for-naboo-id',
            internalName: 'radiant-vii#negotiating-for-naboo',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 3 damage to this unit. If you do, give a Shield token to it',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 }),
            ifYouDo: {
                title: 'Give a Shield token to it',
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}