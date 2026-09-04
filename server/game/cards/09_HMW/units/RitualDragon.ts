import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, EntryType, RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
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
            title: 'This unit enters play ready',
            sourceZoneFilter: WildcardZoneName.Any,
            condition: (context) => context.player.base.hasSomeTrait(Trait.Tatooine),
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });

        registrar.addConstantAbility({
            title: `While you control a ${TextHelper.Trait.Tatooine} base, friendly units enter play ready`,
            condition: (context) => context.player.base.hasSomeTrait(Trait.Tatooine),
            targetController: RelativePlayer.Self,
            ongoingEffect: abilityHelper.ongoingEffects.unitsEnterPlayReady({
                entryType: new Set<EntryType>([EntryType.Played, EntryType.Created, EntryType.Rescued, EntryType.Deployed]),
                cardTypeFilter: WildcardCardType.Unit,
            })
        });
    }
}