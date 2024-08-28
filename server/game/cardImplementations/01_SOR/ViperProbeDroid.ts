import AbilityHelper from '../../AbilityHelper';
import { Card } from '../../core/card/Card';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';

export default class ViperProbeDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8986035098',
            internalName: 'viper-probe-droid'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Look at an opponent\'s hand.',
            immediateEffect: AbilityHelper.immediateEffects.lookAt((context) => ({
                target: context.player.opponent.hand.sort((a, b) => a.name.localeCompare(b.name)),
                chatMessage: true
            }))
        });
    }
}

ViperProbeDroid.implemented = true;