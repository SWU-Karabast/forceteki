import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { DamagePreventionType, Trait } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class BobaFettsArmor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5738033724',
            internalName: 'boba-fetts-armor'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        registrar.addDamagePreventionAbility({
            title: 'If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage',
            preventionType: DamagePreventionType.Reduce,
            preventionAmount: 2,
            targetCondition(card, context) {
                if (context.source.isUpgrade() && card === context.source.parentCard && context.source.parentCard.title === 'Boba Fett') {
                    return true;
                }
                return false;
            },
        });
    }
}