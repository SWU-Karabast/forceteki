import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import * as EnumHelpers from '../../../core/utils/EnumHelpers.js';

export default class AgentKallusSeekingTheRebels extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2649829005',
            internalName: 'agent-kallus#seeking-the-rebels',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Draw a card',
            optional: true,
            when: {
                onCardDefeated: (event, context) =>
                    EnumHelpers.isUnit(event.lastKnownInformation.type) &&
                    event.card.unique &&
                    event.card !== context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.draw(),
            limit: AbilityHelper.limit.perRound(1)
        });
    }
}
