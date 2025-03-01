import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, RelativePlayer } from '../../../core/Constants';
import type Game from '../../../core/Game';
import StaticOngoingEffectImpl from '../../../core/ongoingEffect/effectImpl/StaticOngoingEffectImpl';
import { OngoingCardEffect } from '../../../core/ongoingEffect/OngoingCardEffect';
import type { IOngoingCardEffectProps, IOngoingEffectGenerator } from '../../../Interfaces';
import OngoingEffectLibrary from '../../../ongoingEffects/OngoingEffectLibrary';

export default class StolenATHauler extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6272475624',
            internalName: 'stolen-athauler'
        };
    }

    private canPlayFromOpponentDiscard(): IOngoingEffectGenerator {
        function createOngoingCardEffect(game: Game, source: Card, props: IOngoingCardEffectProps) {
            props.targetController = RelativePlayer.Opponent;
            return new OngoingCardEffect(game, source, props, new StaticOngoingEffectImpl(EffectName.CanPlayFromDiscard, null));
        }
        return createOngoingCardEffect;
    }

    public override setupCardAbilities () {
        this.addWhenDefeatedAbility({
            title: 'Choose an opponent. For this phase, they may play this unit from its owner\'s discard pile for free.',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: [
                    this.canPlayFromOpponentDiscard(),
                    OngoingEffectLibrary.forFree({ match: (card) => card === context.source })
                ]
            }))

        });
    }
}
