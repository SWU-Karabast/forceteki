import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class SpareTheTarget extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5283722046',
            internalName: 'spare-the-target',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Return an enemy non-leader unit to its owner\'s hand. Collect that unit\'s Bounties.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.returnToHand(),
                    AbilityHelper.immediateEffects.collectBounty((context) => {
                        return {
                            bountyProperties: context.target.getBountyKeywords().map((bountyKeyword) => bountyKeyword.abilityProps),
                            bountySource: context.target
                        };
                    })
                ])
            }
        });
    }
}
