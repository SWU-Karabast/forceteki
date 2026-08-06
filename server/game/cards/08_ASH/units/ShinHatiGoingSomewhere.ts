import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class ShinHatiGoingSomewhere extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1043323645',
            internalName: 'shin-hati#going-somewhere',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While this is the only friendly non-leader ground unit, she gains ${TextHelper.Sentinel}`,
            condition: (context) => {
                const friendlyNonLeaderGroundUnits = context.player.getArenaUnits({
                    arena: ZoneName.GroundArena,
                    condition: (card) => card.isNonLeaderUnit(),
                });

                return friendlyNonLeaderGroundUnits.length === 1 && friendlyNonLeaderGroundUnits[0] === context.source;
            },
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}