import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class ArcanaStarMap extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2674341776',
            internalName: 'arcana-star-map#path-to-peridea',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainConstantAbilityTargetingAttached({
            title: 'While attached, double the number of cards its controller searches from their deck',
            ongoingEffect: AbilityHelper.ongoingEffects.doubleDeckSearchCount(),
        });
    }
}
