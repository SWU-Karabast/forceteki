import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Aspect, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class R2D2KnownToMakeMistakes extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3366353612',
            internalName: 'r2d2#known-to-make-mistakes',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'If you control a Command unit, exhaust an enemy ground unit that costs 4 or less',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ aspect: Aspect.Command }),
                onTrue: abilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.GroundArena,
                    cardCondition: (card) => card.isUnit() && card.cost <= 4,
                    immediateEffect: abilityHelper.immediateEffects.exhaust()
                })
            })
        });
    }
}