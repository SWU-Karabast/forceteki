import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class PongKrellItsTreasonThen extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8633377277',
            internalName: 'pong-krell#its-treason-then',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackCompletedAbility({
            title: 'Defeat a unit with less remaining HP than this unit\'s power',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.isUnit() && card.remainingHp < context.source.getPower(),
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}