import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class TheMarauderShuttlingTheBadBatch extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2143627819',
            internalName: 'the-marauder#shuttling-the-bad-batch'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Put a card into play as a resource if it shares a name with a unit you control',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                cardCondition: (card, context) => {
                    const unitTitles = new Set(context.player.getArenaUnits().map((c) => c.title));
                    return unitTitles.has(card.title);
                },
                immediateEffect: AbilityHelper.immediateEffects.resourceCard()
            }
        });
    }
}
