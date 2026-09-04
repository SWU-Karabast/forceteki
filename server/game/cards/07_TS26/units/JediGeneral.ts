import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class JediGeneral extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5760795689',
            internalName: 'jedi-general',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addWhenPlayedAbility({
            title: `If you control a ${TextHelper.Trait.Republic} leader, create a Clone Trooper and give an Experience token to it`,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeLeaderCard({ trait: Trait.Republic }),
                onTrue: abilityHelper.immediateEffects.createCloneTrooper(),
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give this token an Experience token',
                immediateEffect: abilityHelper.immediateEffects.giveExperience({
                    target: ifYouDoContext.resolvedEvents[0]?.generatedTokens,
                })
            }),
        });
    }
}