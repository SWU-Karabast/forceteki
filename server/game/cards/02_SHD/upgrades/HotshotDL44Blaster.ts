import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { PlayType, Trait } from '../../../core/Constants';

export default class HotshotDL44Blaster extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5874342508',
            internalName: 'hotshot-dl44-blaster',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.target.hasSomeTrait(Trait.Vehicle));

        registrar.addTriggeredAbility({
            title: 'When Smuggled, attack with attached unit',
            when: {
                whenPlayedUsingSmuggle: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                target: context.source.parentCard,
                condition: context.event.playType === PlayType.Smuggle,
                onTrue: AbilityHelper.immediateEffects.attack((context) => ({
                    attacker: context.source.parentCard,
                })),
            }))
        });
    }
}
