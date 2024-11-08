import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class DoctorPershing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6722700037',
            internalName: 'doctor-pershing#experimenting-with-life',
        };
    }

    public override setupCardAbilities () {
        this.addActionAbility({
            title: 'Draw a card',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.dealDamage(1, {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit
                })
            ],
            immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.source.controller }))
        });
    }
}

DoctorPershing.implemented = true;
