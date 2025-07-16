import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class FirstOrderTIEFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1034181657',
            internalName: 'first-order-tie-fighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While you control a token unit, this unit gain Raid 1',
            condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isTokenUnit() }),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }
}
