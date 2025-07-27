import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Aspect } from '../../../core/Constants';

export default class GeneralVeersLeadingTheAssault extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6776733024',
            internalName: 'general-veers#leading-the-assault',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If you control a Vigilance unit, deal 2 damage to an enemy base and heal 2 damage from your base',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ aspect: Aspect.Vigilance }),
                onTrue: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.damage((context) => ({ amount: 2, target: context.player.opponent.base })),
                    abilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
                ])
            }),
        });
    }
}