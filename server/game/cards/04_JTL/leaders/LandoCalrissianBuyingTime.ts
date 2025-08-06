import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import {
    AbilityType,
    DeployType,
    KeywordName,
    RelativePlayer,
    WildcardCardType,
    WildcardZoneName,
    ZoneName
} from '../../../core/Constants';

export default class LandoCalrissianBuyingTime extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3658069276',
            internalName: 'lando-calrissian#buying-time',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotDeploy();

        registrar.addActionAbility({
            title: 'Play a unit from your hand. If you do and you control a ground unit and a space unit, give a Shield token to a unit',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit })
            },
            ifYouDo: {
                title: 'Give a Shield token to a unit',
                ifYouDoCondition: (context) => context.player.hasSomeArenaUnit({ arena: ZoneName.GroundArena }) && context.player.hasSomeArenaUnit({ arena: ZoneName.SpaceArena }),
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingGainKeywordTargetingAttached({ keyword: KeywordName.Sentinel });

        registrar.addPilotingAbility({
            title: 'Give a Shield token to a unit in a different arena',
            type: AbilityType.Triggered,
            zoneFilter: WildcardZoneName.AnyArena,
            when: {
                onLeaderDeployed: (event, context) =>
                    event.card === context.source &&
                    event.type === DeployType.LeaderUpgrade
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zone !== context.source.parentCard.zone,
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}