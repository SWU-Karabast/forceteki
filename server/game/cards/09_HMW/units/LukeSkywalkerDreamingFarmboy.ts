import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import {
    EffectName,
    WildcardZoneName
} from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class LukeSkywalkerDreamingFarmboy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'luke-skywalker#dreaming-boy-id',
            internalName: 'luke-skywalker#dreaming-boy',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While it\'s the first round of the game, this unit enters play ready',
            condition: (context) => context.game.roundNumber === 1,
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });
    }
}