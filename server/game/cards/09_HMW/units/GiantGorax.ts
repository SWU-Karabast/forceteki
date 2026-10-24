import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class GiantGorax extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3695328235',
            internalName: 'giant-gorax',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            // TODO TWIN SUNS
            title: 'Your opponent chooses an effect',
            when: {
                onAttack: true,
                whenDefeated: true,
            },
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.base.hasSomeTrait(Trait.Endor),
                onTrue: abilityHelper.immediateEffects.chooseModalEffects((context) => ({
                    amountOfChoices: 1,
                    choosingPlayer: RelativePlayer.Opponent,
                    choices: {
                        ['Your opponent deals 3 damage to your base or a unit you control']:
                            abilityHelper.immediateEffects.selectCard({
                                activePromptTitle: 'Deal 3 damage to an enemy unit or base',
                                cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                                controller: RelativePlayer.Opponent,
                                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
                            }),
                        ['Discard a card from your hand and defeat a resource you control']:
                            abilityHelper.immediateEffects.simultaneous([
                                abilityHelper.immediateEffects.discardCardsFromOwnHand({
                                    amount: 1,
                                    target: context.player.opponent,
                                }),
                                abilityHelper.immediateEffects.selectCard({
                                    activePromptTitle: 'Defeat a resource you control',
                                    choosingPlayer: RelativePlayer.Opponent,
                                    zoneFilter: ZoneName.Resource,
                                    controller: RelativePlayer.Opponent,
                                    immediateEffect: abilityHelper.immediateEffects.defeat(),
                                }),
                            ])
                    }
                }))
            })
        });
    }
}