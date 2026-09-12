import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, TargetMode, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class GiantGorax extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'giant-gorax-id',
            internalName: 'giant-gorax',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            // TODO TWIN SUNS
            title: 'Your opponent chooses if you deal 3 damage to a unit or base they control or if they discard a card from their hand and defeat a resource they control',
            when: {
                onAttack: true,
                whenDefeated: true,
            },
            targetResolver: {
                mode: TargetMode.Select,
                choosingPlayer: RelativePlayer.Opponent,
                condition: (c) => c.player.base.hasSomeTrait(Trait.Endor),
                choices: (context) => ({
                    [`${context.player.name} deal 3 damage to a unit or base you control`]:
                        abilityHelper.immediateEffects.selectCard({
                            cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                            controller: RelativePlayer.Opponent,
                            immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
                        }),
                    ['You discard a card from your hand and defeat a resource you control']:
                        abilityHelper.immediateEffects.simultaneous([
                            abilityHelper.immediateEffects.discardCardsFromOwnHand({
                                amount: 1,
                                target: context.player.opponent,
                            }),
                            abilityHelper.immediateEffects.selectCard({
                                choosingPlayer: RelativePlayer.Opponent,
                                zoneFilter: ZoneName.Resource,
                                controller: RelativePlayer.Opponent,
                                immediateEffect: abilityHelper.immediateEffects.defeat(),
                            }),
                        ])
                })
            }
        });
    }
}