import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChamSyndullaRallyingRyloth extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4019449999',
            internalName: 'cham-syndulla#rallying-ryloth',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Put the top card of your deck into play as a resource',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.resources.length < context.player.opponent.resources.length,
                onTrue: AbilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck(),
                })),
            })
        });
    }
}
