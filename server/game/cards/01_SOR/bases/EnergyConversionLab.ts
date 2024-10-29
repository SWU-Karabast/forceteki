import { BaseCard } from '../../../core/card/BaseCard';
import AbilityHelper from '../../../AbilityHelper';
import { KeywordName, CardType, Location } from '../../../core/Constants';

export default class EnergyConversionLab extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '8327910265',
            internalName: 'energy-conversion-lab',
        };
    }

    public override setupCardAbilities () {
        this.setEpicActionAbility({
            title: 'Play a unit that costs 6 or less from your hand. Give it ambush for this phase',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 6,
                cardTypeFilter: CardType.BasicUnit,
                locationFilter: Location.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.playCardFromHand(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({ effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush) }),
                ])
            }
        });
    }
}

EnergyConversionLab.implemented = true;
