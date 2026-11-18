import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class MorganElsbethTalesBasedOnTruths extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6623286145',
            internalName: 'morgan-elsbeth#tales-based-on-truths',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Reveal the top card of your deck. If it costs 6 or more, draw it. Otherwise, discard it',
            immediateEffect: abilityHelper.immediateEffects.conditional((context) => {
                const topCardOfDeck = context.player.getTopCardOfDeck();
                return {
                    condition: topCardOfDeck?.printedCost >= 6,
                    onTrue: abilityHelper.immediateEffects.revealAndDraw({ target: topCardOfDeck, useDisplayPrompt: true, promptedPlayer: RelativePlayer.Opponent }),
                    onFalse: abilityHelper.immediateEffects.sequential([
                        abilityHelper.immediateEffects.reveal({ target: topCardOfDeck, useDisplayPrompt: true, promptedPlayer: RelativePlayer.Opponent }),
                        abilityHelper.immediateEffects.discardSpecificCard({ target: topCardOfDeck })
                    ])
                };
            })
        });
    }
}