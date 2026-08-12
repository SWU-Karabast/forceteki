import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, Trait, WildcardZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class RitualDragon extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ritual-dragon-id',
            internalName: 'ritual-dragon',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control a ${TextHelper.Trait.Tatooine} base, friendly units enter play ready (including this one)`,
            condition: (context) => context.player.base.hasSomeTrait(Trait.Tatooine),
            sourceZoneFilter: WildcardZoneName.Any,
            matchTarget: (card, context) => card.controller === context.player,
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });
    }
}