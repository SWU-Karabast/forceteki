import AbilityHelper from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class SizeMattersNot extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6980075962',
            internalName: 'size-matters-not'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addDecreaseCostAbility({
            title: 'If you control a Force unit, this upgrade costs 1 less to play.',
            amount: 1,
            condition: (context) => context.player.getArenaUnits({ trait: Trait.Force }).length > 0,
        });

        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit\'s printed power and printed HP are considered to be 5',
            ongoingEffect: AbilityHelper.ongoingEffects.overridePrintedAttributes({
                printedPower: 5,
                printedHp: 5
            })
        });
    }
}
