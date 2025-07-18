import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, CardType, KeywordName } from '../../../core/Constants';

export default class LuminaraUnduliSoftSpokenMaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9832122703',
            internalName: 'luminara-unduli#softspoken-master',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'Gain Grit',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit),
        });

        registrar.addWhenPlayedAbility({
            title: 'Heal 1 damage from a base for each unit you control.',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                    amount: context.player.getArenaUnits().length,
                }))
            }
        });
    }
}

