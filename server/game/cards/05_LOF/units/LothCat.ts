import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class LothCat extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'temp-loth-cat-id',
            internalName: 'loth-cat',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Exhaust a ground unit',
            optional: true,
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            }
        });
    }
}
