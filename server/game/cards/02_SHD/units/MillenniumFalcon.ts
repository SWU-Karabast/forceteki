import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, PlayType } from '../../../core/Constants';

export default class MillenniumFalcon extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5752414373',
            internalName: 'millennium-falcon#landos-pride',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Gain ambush if played from hand',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.playType === PlayType.PlayFromHand,
                onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({ effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush) }),
                onFalse: AbilityHelper.immediateEffects.noAction(),
            })
        });

        /* this.addConstantAbility({
            title: 'Gain Ambush if played from your hand',
            condition: (context) => context.playType === PlayType.PlayFromHand,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });*/
    }
}

MillenniumFalcon.implemented = true;
