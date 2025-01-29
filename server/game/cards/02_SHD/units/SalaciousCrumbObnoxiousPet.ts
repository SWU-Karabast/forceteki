import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class SalaciousCrumbObnoxiousPet extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2744523125',
            internalName: 'salacious-crumb#obnoxious-pet'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Heal 1 damage from your base',
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                amount: 1,
                target: context.source.controller.base
            }))
        });

        this.addActionAbility({
            title: 'Deal 1 damage to a ground unit',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.returnSelfToHandFromPlay()
            ],
            cannotTargetFirst: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
            }
        });
    }
}
