import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class DroidCohort extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7547538214',
            internalName: 'droid-cohort',
        };
    }

    public override setupCardAbilities() {
        this.addGainTriggeredAbilityTargetingAttached({
            title: 'Create a Battle Droid token.',
            when: {
                onCardDefeated: (event, context) => event.card.parentCard === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}

DroidCohort.implemented = true;