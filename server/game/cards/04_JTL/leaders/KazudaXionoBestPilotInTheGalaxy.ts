import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Duration, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class KazudaXionoBestPilotInTheGalaxy extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4531112134',
            internalName: 'kazuda-xiono#best-pilot-in-the-galaxy'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addPilotDeploy();
        registrar.addActionAbility({
            title: 'Select a friendly unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                        effect: AbilityHelper.ongoingEffects.loseAllAbilities(),
                        ongoingEffectDescription: 'remove all abilities from'
                    })
                }),
                AbilityHelper.immediateEffects.playerLastingEffect({
                    effect: AbilityHelper.ongoingEffects.additionalAction(),
                    duration: Duration.Persistent
                })
            ])
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Choose any number of friendly units. They lose all abilities for this round.',
            targetResolver: {
                activePromptTitle: 'Choose friendly units to lose all abilities for this round',
                mode: TargetMode.Unlimited,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                canChooseNoCards: true,
                immediateEffect: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                    effect: AbilityHelper.ongoingEffects.loseAllAbilities(),
                    ongoingEffectDescription: 'remove all abilities from'
                })
            }
        });

        registrar.addPilotingGainTriggeredAbilityTargetingAttached({
            title: 'Choose any number of friendly units. They lose all abilities for this round.',
            when: {
                onAttack: true,
            },
            targetResolver: {
                activePromptTitle: 'Choose friendly units to lose all abilities for this round',
                mode: TargetMode.Unlimited,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                canChooseNoCards: true,
                immediateEffect: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                    effect: AbilityHelper.ongoingEffects.loseAllAbilities(),
                    ongoingEffectDescription: 'remove all abilities from'
                })
            }
        });
    }
}