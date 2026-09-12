import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class ChewbaccasBowcasterHandcraftedTradition extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'chewbaccas-bowcaster#handcrafted-tradition-id',
            internalName: 'chewbaccas-bowcaster#handcrafted-tradition',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Resource the top card of your deck',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentCard?.title === 'Chewbacca',
                onTrue: abilityHelper.immediateEffects.resourceCard((context) => ({ target: context.player.getTopCardOfDeck() }))
            })
        });
    }
}
