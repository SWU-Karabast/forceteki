import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TokenUpgradeCard } from '../../../core/card/TokenCards';

export default class Advantage extends TokenUpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'advantage-id',
            internalName: 'advantage',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat Advantage token',
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attacker === context.source.parentCard ||
                    event.attack.getAllTargets().includes(context.source.parentCard)
            },
            immediateEffect: AbilityHelper.immediateEffects.defeat()
        });
    }
}