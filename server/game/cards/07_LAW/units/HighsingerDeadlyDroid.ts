import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class HighsingerDeadlyDroid extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3224839175',
            internalName: 'highsinger#deadly-droid'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aggression = [Aspect.Aggression];
        const command = [Aspect.Command];
        registrar.addWhenPlayedAbility({
            title: `Give an experience to another friendly ${EnumHelpers.aspectString(command)} unit`,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source && card.isUnit() && card.hasSomeAspect(Aspect.Command),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
        registrar.addWhenDefeatedAbility({
            title: `Give an experience to a friendly ${EnumHelpers.aspectString(aggression)} unit`,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Aggression),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}