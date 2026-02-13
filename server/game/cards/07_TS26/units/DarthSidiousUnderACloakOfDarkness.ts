import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers.js';

export default class DarthSidiousUndeerACloakOfDarkness extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9473986821',
            internalName: 'darth-sidious#under-a-cloak-of-darkness'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly Separatist unit gets +1/+0.',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Separatist),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });

        registrar.addTriggeredAbility({
            title: 'Create a Battle Droid token',
            when: {
                onCardDefeated: (event) => EnumHelpers.isNonTokenUnit(event.lastKnownInformation.type),
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}