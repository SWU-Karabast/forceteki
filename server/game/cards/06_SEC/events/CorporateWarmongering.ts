import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CorporateWarmongering extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'corporate-warmongering-id',
            internalName: 'corporate-warmongering',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a unit +3/+3 for this phase. Give each other friendly unit +1/+1 for this phase.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 3 }),
                }),
            },
            then: (thenContext) => ({
                title: 'Give each other friendly unit +1/+1 for this phase',
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 }),
                    target: thenContext.player.getArenaUnits({ otherThan: thenContext.target })
                })
            })
        });
    }
}