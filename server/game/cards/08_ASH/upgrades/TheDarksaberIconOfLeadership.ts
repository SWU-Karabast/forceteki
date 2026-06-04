import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

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
            title: 'Attached unit is a leader unit and gains the Mandalorian trait',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.isLeader(),
                AbilityHelper.ongoingEffects.gainTrait(Trait.Mandalorian),
            ],
        });

        registrar.addGainConstantAbilityTargetingAttached({
            title: 'While you are paying costs, this unit provides its aspect icons',
            ongoingEffect: AbilityHelper.ongoingEffects.provideAspects({
                providedAspects: (source) => source.aspects,
            }),
        });
    }
}
