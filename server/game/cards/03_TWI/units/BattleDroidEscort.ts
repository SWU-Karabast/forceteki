import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BattleDroidEscort extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5584601885',
            internalName: 'battle-droid-escort',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Create a Battle Droid token.',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onCardDefeated: (event, context) => event.card === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}

BattleDroidEscort.implemented = true;