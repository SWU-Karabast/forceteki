import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SavageOpressMonster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8540765053',
            internalName: 'savage-opress#monster',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Ready this unit.',
            immediateEffect: AbilityHelper.immediateEffects.conditional(
                {
                    condition: (context) => {
                        const player = context.player;
                        const opponent = player.opponent;
                        return player.getArenaUnits().length < opponent.getArenaUnits().length;
                    },
                    onTrue: AbilityHelper.immediateEffects.ready(),
                }
            )
        });
    }
}
