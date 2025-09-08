import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

export default class MinaBonteriStopThisWar extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9378249305',
            internalName: 'mina-bonteri#stop-this-war',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Disclose Command, Command, and Heroism to draw a card',
            immediateEffect: AbilityHelper.immediateEffects.disclose(
                [Aspect.Command, Aspect.Command, Aspect.Heroism]
            ),
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 1 })
            }
        });
    }
}