import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

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
            title: TextHelper.performReplacements(`Give an experience to another friendly ${TextHelper.aspectList(command)} unit`),
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source && card.isUnit() && card.hasSomeAspect(Aspect.Command),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
        registrar.addWhenDefeatedAbility({
            title: TextHelper.performReplacements(`Give an experience to a friendly ${TextHelper.aspectList(aggression)} unit`),
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Aggression),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}