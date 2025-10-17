import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class HeroicARC170 extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3469756679',
            internalName: 'heroic-arc170',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to an enemy unit',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isUnit() && card.damage > 0 }),
                    onTrue: abilityHelper.immediateEffects.damage({ amount: 2 })
                })
            }
        });
    }
}
