import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import {
    AbilityType,
    RelativePlayer,
    Trait,
    WildcardCardType,
    WildcardZoneName,
    ZoneName
} from '../../../core/Constants';

export default class MajorVonregRedBaron extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9763190770',
            internalName: 'major-vonreg#red-baron',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addPilotDeploy();

        registrar.addActionAbility({
            title: 'Play a Vehicle unit from your hand. If you do, give another unit +1/+0 for this phase.',
            cost: [AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardCondition: (card) => card.hasSomeTrait(Trait.Vehicle),
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
            },
            ifYouDo: (ifYouDoContext) => {
                return {
                    title: 'Give another unit +1/+0 for this phase.',
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) => card !== ifYouDoContext.target,
                        immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                        })
                    }
                };
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Give another unit in this arena +1/+0 for this phase.',
            optional: true,
            when: {
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card, context) => card.zoneName === context.source.zoneName && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                })
            },
        });
    }
}