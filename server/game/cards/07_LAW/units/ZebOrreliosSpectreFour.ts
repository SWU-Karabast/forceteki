import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, Conjunction, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class ZebOrreliosSpectreFour extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6658095148',
            internalName: 'zeb-orrelios#spectre-four',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Deal 3 damage to a ground unit. If you control a ${TextHelper.aspectList([Aspect.Command, Aspect.Cunning], Conjunction.Or)} unit, deal 5 damage to a ground unit instead`,
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                activePromptTitle: (context) => `Deal ${context.player.isAspectInPlay(Aspect.Command) || context.player.isAspectInPlay(Aspect.Cunning) ? 5 : 3} damage to a ground unit`,
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                    amount: context.player.isAspectInPlay(Aspect.Command) || context.player.isAspectInPlay(Aspect.Cunning) ? 5 : 3,
                }))
            }
        });
    }
}
