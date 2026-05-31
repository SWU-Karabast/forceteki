import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { Player } from '../../../core/Player';

export default class CrixMadineStrikeTeamStrategist extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'crix-madine#strike-team-strategist-id',
            internalName: 'crix-madine#strike-team-strategist',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Play a ${TextHelper.aspect(Aspect.Heroism)} unit from your hand. It costs ${TextHelper.resource(2)} less for each arena in which you control the most units.`,
            optional: true,
            targetResolver: {
                activePromptTitle: (context) => {
                    const firstPart = `Play a ${TextHelper.aspect(Aspect.Heroism)} unit from your hand.`;
                    const costAdjustment = this.computeCost(context.player);
                    const secondPart = costAdjustment === 0
                        ? '(No cost reduction)'
                        : `It costs ${TextHelper.resource(this.computeCost(context.player))} less.`;

                    return `${firstPart} ${secondPart}`;
                },
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeAspect(Aspect.Heroism),
                immediateEffect: abilityHelper.immediateEffects.playCardFromHand({
                    playAsType: WildcardCardType.Unit,
                    adjustCost: {
                        costAdjustType: CostAdjustType.Decrease,
                        amount: (_, player) => this.computeCost(player)
                    }
                })
            }
        });
    }

    private computeCost (controller: Player): number {
        let arenasWithMostUnits = 0;

        // Check ground arena
        const playerGroundUnits = controller.getArenaUnits({ arena: ZoneName.GroundArena }).length;
        const opponentGroundUnits = controller.opponent.getArenaUnits({ arena: ZoneName.GroundArena }).length;
        if (playerGroundUnits > opponentGroundUnits) {
            arenasWithMostUnits++;
        }

        // Check space arena
        const playerSpaceUnits = controller.getArenaUnits({ arena: ZoneName.SpaceArena }).length;
        const opponentSpaceUnits = controller.opponent.getArenaUnits({ arena: ZoneName.SpaceArena }).length;
        if (playerSpaceUnits > opponentSpaceUnits) {
            arenasWithMostUnits++;
        }

        return arenasWithMostUnits * 2;
    }
}
