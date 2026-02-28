import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class WeequayPirate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1606988687',
            internalName: 'weequay-pirate',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addWhenPlayedAbility({
            title: 'Give an experience token to this unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.paidNoResourcesToPlay(context),
                onTrue: AbilityHelper.immediateEffects.giveExperience()
            })
        });
    }

    private paidNoResourcesToPlay(context: TriggeredAbilityContext): boolean {
        const cardPlayedEvent = context.event;

        if (!cardPlayedEvent) {
            return false;
        }

        return !cardPlayedEvent.costs.resources || cardPlayedEvent.costs.resources === 0;
    }
}
