import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class DiplomaticPageantry extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'diplomatic-pageantry-id',
            internalName: 'diplomatic-pageantry',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a friendly unit and an enemy unit. If you do, give 2 Advantage tokens to that friendly unit.',
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Choose a friendly unit to exhaust',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                },
                enemyUnit: {
                    activePromptTitle: 'Choose an enemy unit to exhaust',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give 2 Advantage tokens to that friendly unit',
                ifYouDoCondition: () => ifYouDoContext.targets.friendlyUnit && ifYouDoContext.targets.enemyUnit,
                immediateEffect: AbilityHelper.immediateEffects.giveAdvantage({
                    target: ifYouDoContext.targets.friendlyUnit,
                    amount: 2
                })
            })
        });
    }
}
