import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class BladeSquadronBWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1965647391',
            internalName: 'blade-squadron-bwing',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give a Shield token to a unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.opponentHasAtLeastThreeExhausted(context),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }),
            })
        });
    }

    private opponentHasAtLeastThreeExhausted(context) {
        const exhaustedUnits = context.player.opponent.getArenaUnits().filter((card) => card.isUnit() && card.exhausted === true);
        return exhaustedUnits.length >= 3;
    }
}
