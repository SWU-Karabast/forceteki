import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MaceWinduPartyCrasher extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5230572435',
            internalName: 'mace-windu#party-crasher',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Ready Mace Windu',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttackerDamage &&
                    event.defeatSource.attack.attacker === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.ready((context) => ({ target: context.source })),
        });
    }
}

MaceWinduPartyCrasher.implemented = true;
