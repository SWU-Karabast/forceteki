import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class KingKatuunkoGreatKingOfToydaria extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'king-katuunko#great-king-of-toydaria-id',
            internalName: 'king-katuunko#great-king-of-toydaria',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'All units gain Restore 1 for this phase',
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 }),
                target: context.game.getArenaUnits(),
            }))
        });
    }
}