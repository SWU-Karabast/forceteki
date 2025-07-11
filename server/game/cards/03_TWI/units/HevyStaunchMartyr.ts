import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName, ZoneName } from '../../../core/Constants';

export default class HevyStaunchMartyr extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0683052393',
            internalName: 'hevy#staunch-martyr'
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'Gain Raid 2',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 }),
        });

        registrar.addWhenDefeatedAbility({
            title: 'Deal 1 damage to each enemy ground unit.',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena })
            }))
        });
    }
}
