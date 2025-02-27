import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class DesperateCommando extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1397553238',
            internalName: 'desperate-commando',
        };
    }

    public override setupCardAbilities () {
        this.addWhenDefeatedAbility({
            title: 'Give a unit -1/-1 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 })
                })
            }
        });
    }
}
