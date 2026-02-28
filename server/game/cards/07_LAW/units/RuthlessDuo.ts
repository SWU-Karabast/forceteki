import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class RuthlessDuo extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8509242087',
            internalName: 'ruthless-duo',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to a ground unit',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.isAspectInPlay(Aspect.Villainy, context.source),
                onTrue: abilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    optional: true,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
                })
            }),
        });
    }
}