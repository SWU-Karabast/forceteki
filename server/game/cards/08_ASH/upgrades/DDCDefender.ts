import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class DDCDefender extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9650520838',
            internalName: 'ddc-defender',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Deal 1 damage to a unit in this unit\'s arena and exhaust it',
            when: {
                onDefense: true
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zone.name === context.source.zone.name,
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.damage((context) => ({
                        amount: 1, target: context.target
                    })),
                    abilityHelper.immediateEffects.exhaust((context) => ({
                        target: context.target
                    }))
                ])
            }
        });
    }
}
