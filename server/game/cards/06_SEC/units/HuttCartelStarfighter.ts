import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HuttCartelStarfighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'hutt-cartel-starfighter-id',
            internalName: 'hutt-cartel-starfighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to this unit',
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                target: context.source,
                amount: 2
            })),
        });
    }
}
