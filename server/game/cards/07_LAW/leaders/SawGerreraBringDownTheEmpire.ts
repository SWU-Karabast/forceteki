import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';

export default class SawGerreraBringDownTheEmpire extends LeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3428873373',
            internalName: 'saw-gerrera#bring-down-the-empire',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit. It gets +2/+0 and gains Overwhelm for this attack. After completing this attack, defeat it.',
            cost: [AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.sequential({
                    gameSystems: [
                        AbilityHelper.immediateEffects.attack({
                            attackerLastingEffects: [
                                { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) },
                                { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm) },
                            ]
                        }),
                        AbilityHelper.immediateEffects.conditional({
                            condition: (context) => context.target.zoneName === ZoneName.GroundArena || context.target.zoneName === ZoneName.SpaceArena,
                            onTrue: AbilityHelper.immediateEffects.defeat()
                        })
                    ],
                    resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                }),
            },
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'Attack with another unit. It gets +2/+0 and gains Overwhelm for this attack. After completing this attack, defeat it.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => AttackHelpers.attackerSurvived(
                    context.event.attack,
                    this.unitsDefeatedThisPhaseWatcher
                ),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    optional: true,
                    cardCondition: (card, context) => card !== context.source,
                    immediateEffect: AbilityHelper.immediateEffects.sequential({
                        gameSystems: [
                            AbilityHelper.immediateEffects.attack({
                                attackerLastingEffects: [
                                    { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) },
                                    { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm) },
                                ]
                            }),
                            AbilityHelper.immediateEffects.conditional({
                                condition: (context) => context.target?.zoneName === ZoneName.GroundArena || context.target?.zoneName === ZoneName.SpaceArena,
                                onTrue: AbilityHelper.immediateEffects.defeat()
                            })
                        ],
                        resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                    }),
                })
            })
        });
    }
}