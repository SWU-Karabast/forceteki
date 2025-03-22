import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class RioDurantWisecrackingWheelman extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8656409691',
            internalName: 'rio-durant#wisecracking-wheelman',
        };
    }

    protected override setupLeaderSideAbilities () {
        this.addPilotDeploy();

        this.addActionAbility({
            title: 'Attack with a space unit. It gets +1/+0 and gains Saboteur for this attack',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityActivationResourceCost(1)],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.SpaceArena,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: [
                        { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur) },
                        { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }) },
                    ]
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities () {
        this.addPilotingGainKeywordTargetingAttached({
            keyword: KeywordName.Saboteur,
        });

        this.addPilotingConstantAbilityTargetingAttached({
            title: 'This unit has +1/+0.',
            condition: (context) => context.source.parentCard.hasSomeTrait(Trait.Transport),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });
    }
}