import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, Trait } from '../../../core/Constants';

export default class TheInvisibleHandImposingFlagship extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0398102006',
            internalName: 'the-invisible-hand#imposing-flagship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addWhenPlayedAbility({
            title: 'Create 4 Battle Droid tokens.',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 4 }),
        });

        registrar.addOnAttackAbility({
            title: 'Exhaust any number of friendly Separatist units',
            optional: true,
            targetResolver: {
                mode: TargetMode.Unlimited,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Separatist) && card.isUnit() && !card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.exhaust((context) => ({
                        target: context.target
                    })),
                    AbilityHelper.immediateEffects.damage((context) => ({
                        target: context.player.opponent.base,
                        amount: context.target.length,
                    }))
                ])
            },
        });
    }
}
