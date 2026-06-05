import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class QueenSorunaWillingToFight extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2299349302',
            internalName: 'queen-soruna#willing-to-fight',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Reveal a unit from your hand',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.reveal({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })
            },
            ifYouDo: (ifYouDoContext) => {
                const revealedCost = ifYouDoContext.target.cost;

                return {
                    title: `Deal 3 damage to a unit that costs ${revealedCost}.`,
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) => card.hasCost() && card.cost === revealedCost,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
                    }
                };
            }
        });
    }
}
