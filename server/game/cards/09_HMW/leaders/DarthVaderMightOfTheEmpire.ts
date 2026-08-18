import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DarthVaderMightOfTheEmpire extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'darth-vader#mightof-the-empire-id',
            internalName: 'darth-vader#mightof-the-empire',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addConstantAbility({
            title: `Friendly units that cost 3 or more gain ${TextHelper.Raid(1)}`,
            targetController: RelativePlayer.Self,
            matchTarget: (card) => card.isUnit() && card.cost >= 3,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addConstantAbility({
            title: `Other friendly units that cost 3 or more gain ${TextHelper.Raid(1)}`,
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card.isUnit() && card.cost >= 3 && card !== context.source,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }
}
