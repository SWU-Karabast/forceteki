import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, CardType, KeywordName } from '../../../core/Constants';

export default class LuminaraUnduliSoftSpokenMaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9832122703',
            internalName: 'luminara-unduli#softspoken-master',
        };
    }

    public override setupCardAbilities() {
        this.addCoordinateAbility({
            type: AbilityType.Constant,
            title: 'Gain Grit',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit),
        });

        this.addWhenPlayedAbility({
            title: 'Heal 1 damage from a base for each unit you control.',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                    amount: context.source.controller.getUnitsInPlay().length,
                }))
            }
        });
    }
}

LuminaraUnduliSoftSpokenMaster.implemented = true;
