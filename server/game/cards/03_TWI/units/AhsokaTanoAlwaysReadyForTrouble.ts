import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class AhsokaTanoAlwaysReadyForTrouble extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7144880397',
            internalName: 'ahsoka-tano#always-ready-for-trouble',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Return to hand',
            cost: AbilityHelper.costs.abilityActivationResourceCost(2),
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.returnToHand((context) => ({
                    target: context.source.upgrades
                })),
                AbilityHelper.immediateEffects.returnToHand()
            ])
        });

        registrar.addConstantAbility({
            title: 'Gain Ambush',
            condition: (context) => {
                const player = context.player;
                const opponent = player.opponent;
                return player.getArenaUnits().length < opponent.getArenaUnits().length;
            },
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}
