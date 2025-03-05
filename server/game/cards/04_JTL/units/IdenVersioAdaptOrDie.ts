import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class IdenVersioAdaptOrDie extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9325037410',
            internalName: 'iden-versio#adapt-or-die',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Give a Shield token to attached unit',
            when: {
                onUpgradeAttached: (event, context) => event.upgradeCard === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.giveShield((context) => ({
                target: context.source.parentCard
            }))
        });
    }
}