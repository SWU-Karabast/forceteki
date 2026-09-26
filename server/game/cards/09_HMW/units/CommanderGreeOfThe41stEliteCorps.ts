import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class CommanderGreeOfThe41stEliteCorps extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7449157652',
            internalName: 'commander-gree#of-the-41st-elite-corps',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While there are 3 or more ${TextHelper.Command} icons among friendly units and upgrades, this unit gains ${TextHelper.Raid(4)}`,
            condition: (context) => context.player.getInPlayCards({
                type: [WildcardCardType.Unit, WildcardCardType.Upgrade]
            })
                .flatMap((x) => x.aspects)
                .filter((x) => x === Aspect.Command)
                .length >= 3,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 4 })
        });
    }
}