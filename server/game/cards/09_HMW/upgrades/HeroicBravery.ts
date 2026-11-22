import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Aspect } from '../../../core/Constants';

export default class HeroicBravery extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8162797914',
            internalName: 'heroic-bravery',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token to the attached unit',
            contextTitle: (context) => `Give a Shield token to ${context.source.parentUnit?.title ?? 'the attached unit'}`,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.parentUnit?.hasSomeAspect(Aspect.Heroism),
                onTrue: abilityHelper.immediateEffects.giveShield((context) => ({ target: context.source.parentUnit }))
            })
        });
    }
}
