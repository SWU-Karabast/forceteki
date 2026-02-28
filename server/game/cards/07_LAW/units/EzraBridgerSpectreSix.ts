import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, Conjunction, WildcardCardType } from '../../../core/Constants';
import { aspectString } from '../../../core/utils/EnumHelpers';

export default class EzraBridgerSpectreSix extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8944855119',
            internalName: 'ezra-bridger#spectre-six',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Heal 2 damage from a unit. If you control a ${aspectString([Aspect.Aggression, Aspect.Cunning], Conjunction.Or)} unit, heal 4 damage from a unit instead`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                activePromptTitle: (context) => `Heal ${context.player.isAspectInPlay([Aspect.Aggression, Aspect.Cunning]) ? 4 : 2} damage from a unit`,
                immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                    amount: context.player.isAspectInPlay([Aspect.Aggression, Aspect.Cunning]) ? 4 : 2,
                }))
            }
        });
    }
}
