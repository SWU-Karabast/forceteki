import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TargetMode } from '../../../core/Constants';

export default class InDebtToCrimsonDawn extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7962923506',
            internalName: 'in-debt-to-crimson-dawn',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Exhaust it unless its controller pay 2 resources',
            when: {
                onCardReadied: (event, context) => {
                    return context.source.parentCard === event.card;
                }
            },
            targetResolver: {
                mode: TargetMode.Select,
                choices: (context) => ({
                    ['Pay 2 resource']: AbilityHelper.immediateEffects.payResourceCost({
                        target: context.source.parentCard.owner,
                        amount: 2
                    }),
                    ['Exhaust it']: AbilityHelper.immediateEffects.exhaust({
                        target: context.source.parentCard
                    })
                })
            }
        });
    }
}
