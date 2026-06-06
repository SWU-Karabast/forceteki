import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TheCyborgMechMysteriousThreat extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4156019795',
            internalName: 'the-cyborg-mech#mysterious-threat',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to an undamaged ground unit or 5 damage to a damaged ground unit',
            targetResolver: {
                mode: TargetMode.Select,
                choosingPlayer: RelativePlayer.Self,
                choices: ({
                    ['Deal 2 damage to an undamaged ground unit']: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Deal 2 damage to an undamaged ground unit',
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: ZoneName.GroundArena,
                        cardCondition: (card) => card.isUnit() && card.damage === 0,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                    }),
                    ['Deal 5 damage to a damaged ground unit']: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Deal 5 damage to a damaged ground unit',
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: ZoneName.GroundArena,
                        cardCondition: (card) => card.isUnit() && card.damage >= 1,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 5 })
                    }),
                })
            }
        });
    }
}