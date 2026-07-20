import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class PointRainReclaimer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8496220683',
            internalName: 'point-rain-reclaimer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `If you control a ${TextHelper.Trait.Jedi} unit, give an Experience token to this unit`,
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.isTraitInPlay(Trait.Jedi),
                onTrue: AbilityHelper.immediateEffects.giveExperience(),
            })
        });
    }
}