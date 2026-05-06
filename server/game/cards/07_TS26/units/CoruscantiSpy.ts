import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, TargetMode } from '../../../core/Constants';

export default class CoruscantiSpy extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0012426111',
            internalName: 'coruscanti-spy',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal 2 damage from each of any number of bases.',
            targetResolver: {
                activePromptTitle: 'Choose bases to heal 2 damage from',
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}