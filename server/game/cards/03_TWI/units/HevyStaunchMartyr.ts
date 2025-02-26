import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName, ZoneName } from '../../../core/Constants';

export default class HevyStaunchMartyr extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0683052393',
            internalName: 'hevy#staunch-martyr'
        };
    }

    protected override setupCardAbilities() {
        this.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'Gain Raid 2',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 }),
        });

        this.addWhenDefeatedAbility({
            title: 'Deal 1 damage to each enemy ground unit.',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.source.controller.opponent.getArenaUnits({ arena: ZoneName.GroundArena })
            }))
        });
    }
}
