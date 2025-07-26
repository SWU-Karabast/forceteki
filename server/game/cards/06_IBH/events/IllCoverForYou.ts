import { type IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class IllCoverForYou extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1941072965',
            internalName: 'ill-cover-for-you',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 1 damage to an enemy unit and 1 damage to another enemy unit',
            targetResolver: {
                activePromptTitle: 'Choose units to deal 1 damage to',
                mode: TargetMode.ExactlyVariable,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: RelativePlayer.Opponent,
                numCardsFunc: (context) => Math.min(2, context.player.opponent.getArenaUnits().length),
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}