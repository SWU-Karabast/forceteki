import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Traitorous extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8055390529',
            internalName: 'traitorous'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Take control of a non-leader unit that costs 3 or less',
            when: {
                onUpgradeAttached: (event, context) => event.upgradeCard === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.parentCard.isNonLeaderUnit() && context.event.parentCard.cost <= 3,
                onTrue: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                    target: context.event.parentCard,
                    newController: context.source.owner
                })),
                onFalse: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true }),
            })
        });
        this.addTriggeredAbility({
            title: 'That unit’s owner takes control of it',
            when: {
                onUpgradeUnattached: (event, context) => event.upgradeCard === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                target: context.event.parentCard,
                newController: context.event.parentCard.owner
            }))
        });
    }
}

Traitorous.implemented = true;