import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, ZoneName } from '../../../core/Constants';

export default class HyenaBomber extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1022691467',
            internalName: 'hyena-bomber'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to a ground unit if you control another aggression unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.isAspectInPlay(Aspect.Aggression, context.source),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                }),
            })
        });
    }
}