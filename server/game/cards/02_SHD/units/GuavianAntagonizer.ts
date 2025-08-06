import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GuavianAntagonizer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2151430798',
            internalName: 'guavian-antagonizer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addBountyAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}
