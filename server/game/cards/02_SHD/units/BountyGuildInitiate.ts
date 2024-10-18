import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location, Trait, WildcardLocation } from '../../../core/Constants';

export default class BountyGuildInitiate extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4057912610',
            internalName: 'bounty-guild-initiate'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to a ground unit if you control another Bounty Hunter unit',
            targetResolver: {
                locationFilter: Location.GroundArena,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isTraitInPlay(Trait.BountyHunter, context.source),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            },
        });
    }
}

BountyGuildInitiate.implemented = true;
