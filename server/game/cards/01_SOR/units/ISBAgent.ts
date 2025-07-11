import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer, CardType, WildcardCardType } from '../../../core/Constants';

export default class ISBAgent extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5154172446',
            internalName: 'isb-agent'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Reveal an event from your hand. If you do, deal 1 damage to a unit',
            targetResolver: {
                cardTypeFilter: CardType.Event,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.reveal({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })
            },
            ifYouDo: {
                title: 'Deal 1 damage to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }
}
