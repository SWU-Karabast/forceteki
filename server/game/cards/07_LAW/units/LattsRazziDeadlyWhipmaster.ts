import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class LattsRazziDeadlyWhipmaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3422504128',
            internalName: 'latts-razzi#deadly-whipmaster'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token or an Experience token to this unit. Then, she deals damage equal to her power to an enemy ground unit',
            targetResolver: {
                mode: TargetMode.Select,
                choices: {
                    ['Give a Shield Token to this unit']: AbilityHelper.immediateEffects.giveShield(),
                    ['Give an Experience token to this unit']: AbilityHelper.immediateEffects.giveExperience(),
                }
            },
            then: (thenContext) => ({
                title: 'Deal damage equal to her power to an enemy ground unit',
                targetResolver: {
                    activePromptTitle: `Deal ${thenContext.source.getPower()} damage to an enemy ground unit`,
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({
                        amount: thenContext.source.getPower(),
                        source: thenContext.source,
                    })
                }
            })
        });
    }
}