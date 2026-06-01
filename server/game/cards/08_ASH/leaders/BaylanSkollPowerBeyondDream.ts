import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BaylanSkollPowerBeyondDream extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'baylan-skoll#power-beyond-dream-id',
            internalName: 'baylan-skoll#power-beyond-dream',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give a friendly unit +2/+2 for this phase',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => !context.player.hasSomeArenaUnit({
                        arena: context.target.zoneName,
                        otherThan: context.target,
                        condition: (card) => card.isNonLeaderUnit()
                    }),
                    onTrue: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                    })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give a friendly unit +2/+2 and Sentinel for this phase',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => !context.player.hasSomeArenaUnit({
                        arena: context.target.zoneName,
                        otherThan: context.target,
                        condition: (card) => card.isNonLeaderUnit()
                    }),
                    onTrue: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: [
                            abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 }),
                            abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                        ]
                    })
                })
            }
        });
    }
}
