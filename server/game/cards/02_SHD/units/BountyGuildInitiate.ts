import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, Trait } from '../../../core/Constants';

export default class BountyGuildInitiate extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4057912610',
            internalName: 'bounty-guild-initiate'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to a ground unit if you control another Bounty Hunter unit',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.isTraitInPlay(Trait.BountyHunter, context.source),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                })
            },
        });
    }
}
