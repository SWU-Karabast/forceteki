import AbilityHelper from '../../../AbilityHelper';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class Foundling extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7687006104',
            internalName: 'foundling',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addConstantAbilityTargetingAttached({
            title: 'Give the Mandalorian trait to the attached card',
            ongoingEffect: AbilityHelper.ongoingEffects.gainTrait(Trait.Mandalorian),
        });
    }
}
