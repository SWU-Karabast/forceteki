import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TheStarhawkPrototypeBattleship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0728753133',
            internalName: 'the-starhawk#prototype-battleship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While paying costs, you pay half as many resources, rounded up',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyPayStageCost({
                amount: (_card, _player, _context, amount) => -Math.floor(amount / 2),
                matchAbilityCosts: true
            })
        });
    }
}
