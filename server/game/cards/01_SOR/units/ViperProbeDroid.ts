import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ViperProbeDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8986035098',
            internalName: 'viper-probe-droid'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Look at an opponent\'s hand.',
            immediateEffect: AbilityHelper.immediateEffects.lookAt((context) => ({
                target: context.player.opponent.hand,
                useDisplayPrompt: true
            }))
        });
    }
}
