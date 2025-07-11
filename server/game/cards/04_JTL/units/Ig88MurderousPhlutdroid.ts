import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { AbilityType } from '../../../core/Constants';

export default class Ig88MurderousPhlutdroid extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1463418669',
            internalName: 'ig88#murderous-phlutdroid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While an enemy unit is damaged, this unit gets +3/+0',
            condition: (context) => context.player.opponent.hasSomeArenaUnit({ condition: (unit: IUnitCard) => unit.damage > 0 }),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })
        });

        registrar.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Constant,
            title: 'While an enemy unit is damaged, this unit gets +3/+0',
            condition: (context) => context.player.opponent.hasSomeArenaUnit({ condition: (unit: IUnitCard) => unit.damage > 0 }),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })
        });
    }
}
