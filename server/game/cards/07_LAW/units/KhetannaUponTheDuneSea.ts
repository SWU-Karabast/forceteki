import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';


export default class KhetannaUponTheDuneSea extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0240338988',
            internalName: 'khetanna#upon-the-dune-sea'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'The next Underworld unit you play this phase costs 1 resource less',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            immediateEffect: abilityHelper.immediateEffects.forThisPhasePlayerEffect({
                ongoingEffectDescription: 'discount the next Underworld unit played by',
                ongoingEffectTargetDescription: 'them',
                effect: abilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Unit,
                    match: (card) => card.hasSomeTrait(Trait.Underworld),
                    limit: abilityHelper.limit.perPlayerPerGame(1),
                    amount: 1
                })
            }),
        });
    }
}