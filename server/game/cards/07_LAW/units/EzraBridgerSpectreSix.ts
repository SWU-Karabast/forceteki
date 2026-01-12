import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardCardType } from '../../../core/Constants';

export default class EzraBridgerSpectreSix extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ezra-bridger#spectre-six-id',
            internalName: 'ezra-bridger#spectre-six',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal 2 damage to a unit. If you control a Aggression or Cunning unit, heal 4 damage to a unit instead',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                activePromptTitle: (context) => `Heal ${context.player.isAspectInPlay(Aspect.Aggression) || context.player.isAspectInPlay(Aspect.Cunning) ? 4 : 2} damage to a unit`,
                immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                    amount: context.player.isAspectInPlay(Aspect.Aggression) || context.player.isAspectInPlay(Aspect.Cunning) ? 4 : 2,
                }))
            }
        });
    }
}
