import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { TokenUpgradeName } from '../../../core/Constants';
import { WildcardCardType } from '../../../core/Constants';
import { GiveTokenUpgradeSystem } from '../../../gameSystems/GiveTokenUpgradeSystem';

export default class BossLyonieHypnotized extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'boss-lyonie#hypnotized-id',
            internalName: 'boss-lyonie#hypnotized',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Choose a token upgrade attached to another unit. Give another one of those tokens to that unit',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) =>
                    card.isTokenUpgrade() && card.parentCard != null && card.parentCard !== context.source,
                // Token upgrade internal names ('shield', 'experience', ...) are the TokenUpgradeName
                // values, so the chosen token tells us which kind to give.
                immediateEffect: new GiveTokenUpgradeSystem((context) => ({
                    target: context.target.parentCard,
                    tokenType: context.target.internalName as TokenUpgradeName,
                })),
            }
        });
    }
}
