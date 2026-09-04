import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class GeneralGrievousSeparatistWarlord extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'general-grievous#separatist-warlord-id',
            internalName: 'general-grievous#separatist-warlord',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play 2 units from your hand',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.playMultipleCardsFromHand({
                maxCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                playAsType: WildcardCardType.Unit,
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control more units than an opponent, this unit gets +3/+0',
            condition: (context) => context.player.getArenaUnits().length > context.player.opponent.getArenaUnits().length,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })
        });
    }
}
