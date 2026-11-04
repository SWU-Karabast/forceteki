import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { WildcardCardType } from '../../../core/Constants';
import { Helpers } from '../../../core/utils/Helpers';

export default class QiraSurvivor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'qira#survivor-id',
            internalName: 'qira#survivor',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give 2 Experience tokens to this unit',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                target: context.source,
                amount: 2
            }))
        });

        registrar.addWhenDefeatedAbility({
            title: 'Give an Experience token to a unit for each Experience token that was on this unit',
            contextTitle: (context) => `Give ${Helpers.pluralize(this.experienceCountWhenDefeated(context), '1 Experience token', 'Experience tokens')} to a unit`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                    amount: this.experienceCountWhenDefeated(context)
                }))
            }
        });
    }

    // the Experience tokens leave play along with this unit, so count them from its last known information
    private experienceCountWhenDefeated(context: TriggeredAbilityContext): number {
        return (context.event.lastKnownInformation.upgrades ?? []).filter((upgrade) => upgrade.isExperience()).length;
    }
}
