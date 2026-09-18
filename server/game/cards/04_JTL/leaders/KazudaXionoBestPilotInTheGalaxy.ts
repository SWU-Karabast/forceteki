import type { IAbilityHelper } from '../../../AbilityHelper';
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

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotDeploy();
        registrar.addActionAbility({
            title: 'Remove all abilities from a friendly unit, then take another action',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Choose a friendly unit to lose all abilities for this round',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                        title: 'Lose all abilities for this round',
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

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Remove all abilities from any number of friendly units',
            targetResolver: {
                activePromptTitle: 'Choose friendly units to lose all abilities for this round',
                mode: TargetMode.Unlimited,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                canChooseNoCards: true,
                immediateEffect: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                    title: 'Lose all abilities for this round',
                    effect: AbilityHelper.ongoingEffects.loseAllAbilities(),
                    ongoingEffectDescription: 'remove all abilities from'
                })
            }
        });

        registrar.addPilotingGainTriggeredAbilityTargetingAttached({
            title: 'Remove all abilities from any number of friendly units',
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
                    title: 'Lose all abilities for this round',
                    effect: AbilityHelper.ongoingEffects.loseAllAbilities(),
                    ongoingEffectDescription: 'remove all abilities from'
                })
            }
        });
    }
}