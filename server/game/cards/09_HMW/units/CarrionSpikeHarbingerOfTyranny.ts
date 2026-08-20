import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class CarrionSpikeHarbingerOfTyranny extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'carrion-spike#harbinger-of-tyranny-id',
            internalName: 'carrion-spike#harbinger-of-tyranny',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `For each upgrade on your base, this unit gets +1/+0 and gains ${TextHelper.Restore(1)}`,
            matchTarget: (target) => (target.controller?.base.upgrades.length ?? 0) > 0,
            ongoingEffect: [
                abilityHelper.ongoingEffects.modifyStats((target) => ({ hp: 0, power: target.controller?.base.upgrades.length ?? 0 })),
                abilityHelper.ongoingEffects.gainKeyword((target) => ({ keyword: KeywordName.Restore, amount: target.controller?.base.upgrades.length ?? 0 }))
            ]
        });
    }
}