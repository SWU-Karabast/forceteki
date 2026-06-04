import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class PoeDameronIllComeBackForYou extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6619522667',
            internalName: 'poe-dameron#ill-come-back-for-you',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'All units lose Sentinel',
            matchTarget: () => true,
            ongoingEffect: abilityHelper.ongoingEffects.loseKeyword(KeywordName.Sentinel)
        });
    }
}