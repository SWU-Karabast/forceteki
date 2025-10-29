import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { DamageModificationType, Trait } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class BobaFettsArmor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5738033724',
            internalName: 'boba-fetts-armor'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addDamageModificationAbility({
            title: 'If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage',
            modificationType: DamageModificationType.Reduce,
            amount: 2,
            shouldCardHaveDamageModification: (card, context) => context.source.isUpgrade() && card === context.source.parentCard && context.source.parentCard.title === 'Boba Fett'
        });
    }
}