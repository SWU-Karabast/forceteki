import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class AnakinSkywalkerSecretHusband extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'anakin-skywalker#secret-husband-id',
            internalName: 'anakin-skywalker#secret-husband',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control Padmé Amidala, this unit gains Raid 2.',
            condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Padmé Amidala'),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}
