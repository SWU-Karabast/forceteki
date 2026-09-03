import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class SurveillanceCruiser extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'surveillance-cruiser-id',
            internalName: 'surveillance-cruiser',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `If an opponent controls an ${TextHelper.Trait.Endor}, ${TextHelper.Trait.Kashyyyk}, ${TextHelper.Trait.Naboo}, or ${TextHelper.Trait.Tatooine} base, draw a card`,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.opponent.base.hasSomeTrait([Trait.Endor, Trait.Kashyyyk, Trait.Naboo, Trait.Tatooine]),
                onTrue: abilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
            })
        });
    }
}
