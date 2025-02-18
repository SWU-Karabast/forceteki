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
                cardCondition: (card) => card.hasSomeTrait(Trait.Separatist) && card.isPlayable() && !card.exhausted,
            },
            then: (thenContext) => ({
                title: 'Deal 1 damage to the defending player\'s base for each unit exhausted this way',
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    target: thenContext.player.opponent.base,
                    amount: thenContext.target.length,
                })
            })
        });
    }
}
