import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, KeywordName, PlayType } from '../../../core/Constants';

export default class MillenniumFalconLandosPride extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5752414373',
            internalName: 'millennium-falcon#landos-pride',
        };
    }

    public override setupCardAbilities(sourceCard: this) {
        let lastPlayedFromHandId: number | null = null;

        this.game.on(EventName.OnCardPlayed, (event) => {
            if (event.card === sourceCard && event.playType === PlayType.PlayFromHand) {
                lastPlayedFromHandId = event.card.inPlayId;
            }
        });

        this.addConstantAbility({
            title: 'This unit gains Ambush if it was played from hand',
            condition: (context) => context.source.isInPlay() && lastPlayedFromHandId === context.source.inPlayId,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}
