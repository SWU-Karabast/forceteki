import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class AdamantEwoks extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'adamant-ewoks-id',
            internalName: 'adamant-ewoks',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to a base and 1 damage to an enemy unit',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (c) => c.player.isTraitInPlay(Trait.Ewok, c.source) || c.player.base.hasSomeTrait(Trait.Endor),
                onTrue: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Deal 1 damage to a base',
                        cardTypeFilter: CardType.Base,
                        immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
                    }),
                    abilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Deal 1 damage to an enemy unit',
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
                    }),
                ])
            })
        });
    }
}