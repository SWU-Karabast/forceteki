import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class PongKrellItsTreasonThen extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8633377277',
            internalName: 'pong-krell#its-treason-then',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Defeat a unit with less remaining HP than this unit\'s power',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && card.remainingHp < context.source.getPower(),
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}