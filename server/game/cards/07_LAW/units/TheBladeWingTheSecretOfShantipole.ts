import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class TheBladeWingTheSecretOfShantipole extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-blade-wing#the-secret-of-shantipole-id',
            internalName: 'the-blade-wing#the-secret-of-shantipole',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return a non-leader unit to its owner\'s hand',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: abilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}