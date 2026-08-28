import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TheWarriorDeftDuelist extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-warrior#deft-duelist-id',
            internalName: 'the-warrior#deft-duelist',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: `Play a unit with 3 or less power from your hand. Give it ${TextHelper.Ambush} for this phase`,
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            cannotTargetFirst: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.getPrintedPower() <= 3,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: abilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        abilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
                        abilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
                        }),
                    ],
                    resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                }),
            }
        });
    }
}
