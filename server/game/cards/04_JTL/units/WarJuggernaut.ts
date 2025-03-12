import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class WarJuggernaut extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4203363893',
            internalName: 'war-juggernaut',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'This unit gets +1/+0 for each damaged unit.',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((_target, context) => {
                const playerDamagedUnits = context.player.getUnitsInPlay(WildcardZoneName.AnyArena, (unit) => unit.damage > 0).length;
                const opponentDamagedUnits = context.player.opponent.getUnitsInPlay(WildcardZoneName.AnyArena, (unit) => unit.damage > 0).length;

                return { power: playerDamagedUnits + opponentDamagedUnits, hp: 0 };
            })
        });

        this.addWhenPlayedAbility({
            title: 'Deal 1 damage to each of any number of units.',
            targetResolver: {
                activePromptTitle: 'Choose units to deal 1 damage to.',
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}