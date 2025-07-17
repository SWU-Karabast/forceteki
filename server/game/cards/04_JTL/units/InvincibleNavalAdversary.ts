import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class InvincibleNavalAdversary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9958088138',
            internalName: 'invincible#naval-adversary',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'If you control a unique Separatist card, this unit costs 1 resource less to play',
            condition: (context) => context.player.controlsCardWithTrait(Trait.Separatist, true),
            amount: 1
        });

        registrar.addTriggeredAbility({
            title: 'Return a non-leader unit that costs 3 or less to its owner\'s hand',
            when: {
                onLeaderDeployed: (event, context) => event.context.player === context.player,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.hasCost() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}
