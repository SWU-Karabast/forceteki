import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';
import * as Contract from '../../utils/Contract';
import type { Card } from '../../card/Card';
import type { FormatMessage } from '../../chat/GameChat';
import { EffectName } from '../../Constants';

export class CloneUnitEffect extends OngoingEffectValueWrapper<Card> {
    public constructor(clonedUnit: Card) {
        // If we are cloning a unit that is itself a clone, we need to find the original unit
        // to ensure that we clone the correct abilities
        while (clonedUnit.hasOngoingEffect(EffectName.CloneUnit)) {
            clonedUnit = clonedUnit.getOngoingEffectValues<Card>(EffectName.CloneUnit)[0];
        }

        const effectDescription: FormatMessage = {
            format: 'clone {0}',
            args: [clonedUnit]
        };

        Contract.assertTrue(clonedUnit.isUnit(), 'Only units can be cloned');
        Contract.assertTrue(clonedUnit.hasStandardAbilitySetup(), 'Only units with standard ability setup can be cloned');

        super(clonedUnit, effectDescription);
    }

    public override apply(target: Card): void {
        super.apply(target);

        Contract.assertTrue(target.isUnit());
        Contract.assertTrue(target.hasStandardAbilitySetup());

        const clonedUnit = this.getValue();
        Contract.assertTrue(clonedUnit.hasStandardAbilitySetup());

        clonedUnit.setupCardAbilities(target);
    }

    public override unapply(target: Card): void {
        super.unapply(target);

        if (target.canRegisterActionAbilities()) {
            for (const actionAbility of target.getPrintedActionAbilities()) {
                target.removePrintedActionAbility(actionAbility.uuid);
            }
        }

        if (target.canRegisterTriggeredAbilities()) {
            for (const actionAbility of target.getPrintedTriggeredAbilities()) {
                target.removePrintedTriggeredAbility(actionAbility.uuid);
            }
        }

        if (target.canRegisterConstantAbilities()) {
            for (const actionAbility of target.getPrintedConstantAbilities()) {
                target.removePrintedConstantAbility(actionAbility.uuid);
            }
        }
    }
}