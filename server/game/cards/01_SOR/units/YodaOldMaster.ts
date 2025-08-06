import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class YodaOldMaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4405415770',
            internalName: 'yoda#old-master'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Choose any number of players to draw 1 card',
            targetResolver: {
                mode: TargetMode.MultiplePlayers,
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}
