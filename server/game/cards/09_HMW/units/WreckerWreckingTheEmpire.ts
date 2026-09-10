import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class WreckerWreckingTheEmpire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'wrecker#wrecking-the-empire-id',
            internalName: 'wrecker#wrecking-the-empire',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Each player chooses a unit they control. Deal 3 damage to each chosen unit',
            targetResolvers: {
                opponentChoice: {
                    choosingPlayer: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
                },
                selfChoice: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
                }
            }
        });
    }
}