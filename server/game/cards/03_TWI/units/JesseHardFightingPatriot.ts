import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class JesseHardFightingPatriot extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5936350569',
            internalName: 'jesse#hardfighting-patriot',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'An opponent creates 2 Battle Droid tokens.',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid((context) => ({
                amount: 2,
                target: context.player.opponent
            }))
        });
    }
}

JesseHardFightingPatriot.implemented = true;
