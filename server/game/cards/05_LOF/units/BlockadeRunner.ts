import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType } from '../../../core/Constants';

export default class BlockadeRunner extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3099740319',
            internalName: 'blockade-runner',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Give an Experience token to this unit',
            optional: true,
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker === context.source &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.getAllTargets().some((target) => target.isBase())) || event.type === DamageType.Overwhelm)
            },
            immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
        });
    }
}
