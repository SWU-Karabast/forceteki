import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class GovernorPryceTyrantOfLothal extends LeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'governor-pryce#tyrant-of-lothal-id',
            internalName: 'governor-pryce#tyrant-of-lothal',
        };
    }

    protected override setupLeaderSideAbilities (registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Ready a token unit',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: CardType.TokenUnit,
                immediateEffect: abilityHelper.immediateEffects.ready()
            },
        });
    }

    protected override setupLeaderUnitSideAbilities (registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Create a Spy token',
            immediateEffect: abilityHelper.immediateEffects.createSpy()
        });

        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for each ready friendly token unit',
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((_, context) => {
                const tokenUnitLength = context.player.getArenaUnits({ condition: (card) => card.isTokenUnit() && !card.exhausted }).length;
                return ({
                    power: tokenUnitLength,
                    hp: 0
                });
            })
        });
    }
}