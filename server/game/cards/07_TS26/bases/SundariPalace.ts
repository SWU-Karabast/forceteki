import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { GameStateChangeRequired, PhaseName, RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';
import { BaseCard } from '../../../core/card/BaseCard';

export default class SundariPalace extends BaseCard {
    protected override getImplementationId() {
        return {
            id: '0344986336',
            internalName: 'sundari-palace',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'For each friendly leader unit, resource card from your hand. If you do, defeat that many friendly resources at the start of the regroup phase',
            targetResolver: {
                mode: TargetMode.UpToVariable,
                zoneFilter: ZoneName.Hand,
                numCardsFunc: (context) => context.player.getArenaUnits({ condition: (c) => c.isLeaderUnit() }).length,
                canChooseNoCards: true,
                immediateEffect: abilityHelper.immediateEffects.resourceCard()
            },
            ifYouDo: (ifYouDoContext) => {
                return ({
                    title: 'Defeat that many friendly resources at the start of the regroup phase',
                    immediateEffect: abilityHelper.immediateEffects.delayedPlayerEffect({
                        title: 'Defeat a resource for each card resourced with Sundari Palace\'s Epic Action',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup,
                        },
                        immediateEffect: abilityHelper.immediateEffects.selectCard({
                            activePromptTitle: () => `Defeat ${ifYouDoContext.targets.target.length} resources`,
                            mode: TargetMode.ExactlyVariable,
                            numCardsFunc: () => ifYouDoContext.targets.target.length,
                            controller: RelativePlayer.Self,
                            zoneFilter: ZoneName.Resource,
                            mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                            immediateEffect: abilityHelper.immediateEffects.defeat()
                        })
                    })
                });
            }
        });
    }
}
