import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardZoneName } from '../../../core/Constants';

export default class FettsFiresprayPursuingTheBounty extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4300219753',
            internalName: 'fetts-firespray#pursuing-the-bounty',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'If you control Boba Fett or Jango Fett (as a leader or unit), ready this unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    context.player.controlsLeaderOrUnitWithTitle('Boba Fett') ||
                    context.player.controlsLeaderOrUnitWithTitle('Jango Fett'),
                onTrue: AbilityHelper.immediateEffects.ready((context) => ({ target: context.source })),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });

        this.addActionAbility({
            title: 'Exhaust a non-unique unit',
            cost: AbilityHelper.costs.abilityResourceCost(2),
            targetResolver: {
                cardCondition: (card) => card.isUnit() && !card.unique,
                immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            }
        });
    }
}
