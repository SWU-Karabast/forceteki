import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BattleDroidEscort extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5584601885',
            internalName: 'battle-droid-escort',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Create a Battle Droid token.',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}
