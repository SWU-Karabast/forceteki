import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class OverwhelmingBarrage extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1900571801',
            internalName: 'overwhelming-barrage',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a friendly unit +2/+2 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            },
            then: (thenContext) => ({
                title: 'Deal damage equal to the unit\'s power divided as you choose among any number of other units',
                thenCondition: (context) => context.target != null,
                immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong({
                    amountToDistribute: thenContext.target?.getPower(),
                    canChooseNoTargets: true,
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card !== thenContext.target,
                    source: thenContext.target
                })
            })
        });
    }
}
