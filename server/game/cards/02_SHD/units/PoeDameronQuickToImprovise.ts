import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class PoeDameronQuickToImprovise extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5966087637',
            internalName: 'poe-dameron#quick-to-improvise'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard up to 3 cards from your hand.',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'For each card discarded, choose a different option:',
                effectArgs: [ifYouDoContext.target.length],
                immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                    amountOfChoices: ifYouDoContext.target.length,
                    choices: () => ({
                        ['Deal 2 damage to a unit or base.']: AbilityHelper.immediateEffects.selectCard({
                            immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                        }),
                        ['Defeat an upgrade.']: AbilityHelper.immediateEffects.selectCard({
                            cardTypeFilter: WildcardCardType.Upgrade,
                            immediateEffect: AbilityHelper.immediateEffects.defeat(),
                        }),
                        ['An opponent discards a card from their hand.']: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                            amount: 1,
                            target: context.player.opponent,
                        })),
                    })
                }),
            })
        });
    }
}
