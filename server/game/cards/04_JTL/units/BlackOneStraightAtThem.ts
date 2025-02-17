import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class BlackOneStraightAtThem extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3389903389',
            internalName: 'black-one#straight-at-them'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While this unit is upgraded, it gets +1/+0.',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });

        this.addOnAttackAbility({
            title: 'If you control Poe Dameron (as a unit, upgrade, or leader), you may deal 1 damage to a unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => this.doesControlPoeDameron(context),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }

    private doesControlPoeDameron (context): boolean {
        return context.source.controller.leader.title === 'Poe Dameron' ||
          context.source.controller.getUnitsInPlay(WildcardZoneName.AnyArena, (card) => card.title === 'Poe Dameron').length > 0 ||
          context.source.controller.getUpgradesInPlay(WildcardZoneName.AnyArena, (card) => card.title === 'Poe Dameron').length > 0;
    }
}