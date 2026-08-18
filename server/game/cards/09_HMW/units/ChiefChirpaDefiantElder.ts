import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class ChiefChirpaDefiantElder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'chief-chirpa#defiant-elder-id',
            internalName: 'chief-chirpa#defiant-elder',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `This unit gets +1/+0 for each other friendly ${TextHelper.Trait.Ewok} unit`,
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((target, context) => ({
                power: context.player.getArenaUnits({ otherThan: target, trait: Trait.Ewok }).length,
                hp: 0
            }))
        });
    }
}