import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class ChancellorValorumCivilServant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'chancellor-valorum#civil-servant-id',
            internalName: 'chancellor-valorum#civil-servant',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Command, Aspect.Command, Aspect.Command];
        registrar.addOnAttackCompletedAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)} to put the top card of your deck into play as a resource`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Put the top card of your deck into play as a resource',
                immediateEffect: abilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck(),
                })),
            }
        });
    }
}
