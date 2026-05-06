import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, ZoneName } from '../../../core/Constants';

export default class BladeOfTalzinAGiftOfShadows extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'blade-of-talzin#a-gift-of-shadows-id',
            internalName: 'blade-of-talzin#a-gift-of-shadows',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenDefeatedAbility({
            title: 'Return this upgrade from your discard pile to your hand',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    context.event.lastKnownInformation.parentCard.hasSomeTrait(Trait.Night) &&
                    context.source.zoneName === ZoneName.Discard,
                onTrue: abilityHelper.immediateEffects.returnToHand((context) => ({ target: context.source }))
            })
        });
    }
}