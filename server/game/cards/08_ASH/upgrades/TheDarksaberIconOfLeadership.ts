import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class TheDarksaberIconOfLeadership extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3629508713',
            internalName: 'the-darksaber#icon-of-leadership',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) =>
            context.attachTarget.unique && !context.attachTarget.hasSomeTrait(Trait.Vehicle)
        );

        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit is a leader unit',
            ongoingEffect: AbilityHelper.ongoingEffects.isLeader(),
        });

        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit gains the Mandalorian trait',
            ongoingEffect: AbilityHelper.ongoingEffects.gainTrait(Trait.Mandalorian),
        });

        registrar.addGainConstantAbilityTargetingAttached({
            title: 'While you are paying costs, this unit provides its aspect icons',
            ongoingEffect: AbilityHelper.ongoingEffects.provideAspects({
                cardTypeFilter: WildcardCardType.Playable,
                providedAspects: (source) => source.aspects,
            }),
        });
    }
}
