import AbilityHelper from '../../../AbilityHelper';
import type { Attack } from '../../../core/attack/Attack';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class CorruptedSaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8085392838',
            internalName: 'corrupted-saber',
        };
    }

    protected override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'The defender gets -2/-0 for this attack',
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Force),
            immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect((context) => ({
                target: (context.event.attack as Attack).getAllTargets(),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
            }))
        });
    }
}