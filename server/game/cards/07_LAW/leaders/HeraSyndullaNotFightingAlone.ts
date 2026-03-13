import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { IConstantAbilityProps } from '../../../Interfaces';

export default class HeraSyndullaNotFightingAlone extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3422452539',
            internalName: 'hera-syndulla#not-fighting-alone',
        };
    }

    private buildHeraAbilityProperties (AbilityHelper: IAbilityHelper): IConstantAbilityProps<LeaderUnitCard> {
        return {
            title: `Ignore the aspect penalty on ${TextHelper.Heroism} cards you play`,
            targetController: RelativePlayer.Self,
            condition: (context) => context.player.getArenaUnits().length >= 2,
            ongoingEffect: AbilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                cardTypeFilter: WildcardCardType.Unit,
                match: (card) => card.hasSomeAspect(Aspect.Heroism)
            })
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildHeraAbilityProperties(AbilityHelper));
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildHeraAbilityProperties(AbilityHelper));
    }
}
