import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class LeiasDisguise extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'leias-disguise-id',
            internalName: 'leias-disguise',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit gains the Underworld trait',
            ongoingEffect: abilityHelper.ongoingEffects.gainTrait(Trait.Underworld)
        });

        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token to a friendly unit',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard?.title === 'Leia Organa',
                onTrue: abilityHelper.immediateEffects.selectCard({
                    controller: RelativePlayer.Self,
                    immediateEffect: abilityHelper.immediateEffects.giveShield()
                })
            })
        });
    }
}
