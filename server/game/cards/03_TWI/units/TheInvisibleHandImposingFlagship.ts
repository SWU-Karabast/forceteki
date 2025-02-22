import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class TheInvisibleHandImposingFlagship extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0398102006',
            internalName: 'the-invisible-hand#imposing-flagship',
        };
    }

    public override setupCardAbilities(): void {
        this.addWhenPlayedAbility({
            title: 'Create 4 Battle Droid tokens.',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 4 }),
        });

        this.addOnAttackAbility({
            title: 'Exhaust any number of friendly Separatist units',
            optional: true,
            targetResolver: {
                mode: TargetMode.Unlimited,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
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
