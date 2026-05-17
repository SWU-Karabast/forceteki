import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, ZoneName } from '../../../core/Constants';

export default class ShinHatiGoingSomewhere extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'shin-hati#going-somewhere-id',
            internalName: 'shin-hati#going-somewhere',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this is the only friendly non-leader ground unit, she gains Sentinel',
            condition: (context) => context.player.getArenaUnits({
                arena: ZoneName.GroundArena,
                condition: (card) => card.isNonLeaderUnit(),
            }).length === 1,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}