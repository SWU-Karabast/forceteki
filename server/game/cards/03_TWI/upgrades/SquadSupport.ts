import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class SquadSupport extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3292172753',
            internalName: 'squad-support'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card: Card) => !card.isLeader());

        registrar.addGainConstantAbilityTargetingAttached({
            title: 'This unit gets +1/+1 for each Trooper unit you control.',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => {
                const trooperUnits = target.controller.getArenaUnits({ trait: Trait.Trooper });
                return {
                    power: trooperUnits.length,
                    hp: trooperUnits.length,
                };
            })
        });
    }
}
