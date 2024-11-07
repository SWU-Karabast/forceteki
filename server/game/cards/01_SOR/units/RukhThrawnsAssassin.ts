import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType } from '../../../core/Constants';

export default class RukhThrawnsAssassin extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3280523224',
            internalName: 'rukh#thrawns-assassin',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Defeat unit being attacked',
            when: {
                onDamageDealt: (event, context) =>
                    event.type === DamageType.Combat &&
                    event.damageSource.attack.attacker === context.source &&
                    event.damageSource.damageDealtBy === context.source &&
                    event.damageSource.attack.target?.isNonLeaderUnit()
            },
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({ target: context.event.damageSource.attack.target })),
        });
    }
}

RukhThrawnsAssassin.implemented = true;
