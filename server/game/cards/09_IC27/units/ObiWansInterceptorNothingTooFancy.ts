import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class ObiWansInterceptorNothingTooFancy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'obiwans-interceptor#nothing-too-fancy-id',
            internalName: 'obiwans-interceptor#nothing-too-fancy',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Other friendly ${TextHelper.Trait.Republic} units get +0/+1`,
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeTrait(Trait.Republic),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}