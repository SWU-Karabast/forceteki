import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, ZoneName } from '../../../core/Constants';

export default class ZebOrreliosSpectreFour extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'zeb-orrelios#spectre-four-id',
            internalName: 'zeb-orrelios#spectre-four',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 3 damage to a ground unit. If you control a Command or Cunning unit, deal 5 damage to a ground unit instead',
            contextTitle: (context) => `Deal ${context.player.isAspectInPlay(Aspect.Command) || context.player.isAspectInPlay(Aspect.Cunning) ? 5 : 3} damage to a ground unit`,
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                    amount: context.player.isAspectInPlay(Aspect.Command) || context.player.isAspectInPlay(Aspect.Cunning) ? 5 : 3,
                }))
            }
        });
    }
}
