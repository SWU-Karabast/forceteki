import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ResupplyCarrier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0926549684',
            internalName: 'resupply-carrier',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Put the top card of your deck into play as a resource',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({
                target: context.player.getTopCardOfDeck()
            }))
        });
    }
}