import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class EvisceratorBurnThemAway extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0839374599',
            internalName: 'eviscerator#burn-them-away',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give 2 Advantage tokens to each other friendly unit',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            immediateEffect: abilityHelper.immediateEffects.giveAdvantage((context) => ({
                amount: 2,
                target: context.player.getArenaUnits({ otherThan: context.source })
            }))
        });

        registrar.addConstantAbility({
            title: 'Advantage tokens on friendly units lose all abilities',
            matchTarget: (card) => card.isAdvantage(),
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Upgrade,
            ongoingEffect: abilityHelper.ongoingEffects.loseAllAbilities()
        });
    }
}