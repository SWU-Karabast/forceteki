import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RecklessGunslinger extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9690731982',
            internalName: 'reckless-gunslinger'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Deal 1 damage to each base',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 1,
                    target: context.source.controller.opponent.base,
                })),
                AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 1,
                    target: context.source.controller.base,
                })),
            ]),
        });
    }
}

RecklessGunslinger.implemented = true;