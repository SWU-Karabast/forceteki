import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class NoOneEverKnew extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'no-one-ever-knew-id',
            internalName: 'no-one-ever-knew',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'For each friendly Official unit, exhaust an enemy unit',
            targetResolver: {
                mode: TargetMode.ExactlyVariable,
                cardTypeFilter: WildcardCardType.Unit,
                numCardsFunc: (context) => Math.min(context.player.getArenaUnits({ trait: Trait.Official }).length, context.player.opponent.getArenaUnits().length),
                controller: RelativePlayer.Opponent,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            },
        });
    }
}