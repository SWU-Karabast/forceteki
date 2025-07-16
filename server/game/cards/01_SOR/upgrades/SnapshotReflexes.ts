import AbilityHelper from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class SnapshotReflexes extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9985638644',
            internalName: 'snapshot-reflexes'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with attached unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.attack((context) => ({
                target: context.source.parentCard
            }))
        });
    }
}
