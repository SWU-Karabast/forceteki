import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class MinaBonteriStopThisWar extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9378249305',
            internalName: 'mina-bonteri#stop-this-war',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Command, Aspect.Command, Aspect.Heroism];
        registrar.addWhenDefeatedAbility({
            title: `Disclose ${TextHelper.aspectList(aspects)} to draw a card`,
            immediateEffect: AbilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 1 })
            }
        });
    }
}