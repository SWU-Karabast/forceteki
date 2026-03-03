import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class TheGalleonMaraudingPirateShip extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8897596897',
            internalName: 'the-galleon#marauding-pirate-ship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Aggression, Aspect.Aggression, Aspect.Villainy];
        registrar.addWhenPlayedAbility({
            title: TextHelper.performReplacements(`Disclose ${TextHelper.aspectList(aspects)} to create 3 Spy tokens `),
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Create 3 Spy tokens',
                immediateEffect: abilityHelper.immediateEffects.createSpy({ amount: 3 })
            }
        });
    }
}
