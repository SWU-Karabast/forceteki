import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class DengarTakeYourShot extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8453622426',
            internalName: 'dengar#take-your-shot',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Create a Credit token',
            limit: AbilityHelper.limit.perRound(1),
            when: {
                onCardDefeated: (event, context) => this.isHighestCostAmongEnemyUnits(event, context)
            },
            immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
        });
    }

    private isHighestCostAmongEnemyUnits(event, context: TriggeredAbilityContext): boolean {
        const isEnemyUnit = EnumHelpers.isUnit(event.lastKnownInformation.type) &&
          event.lastKnownInformation.controller !== context.player;

        if (!isEnemyUnit) {
            return false;
        }

        // We need to consider other enemy units that may have been defeated at the same time
        const allDefeatedEnemyUnitEvents = event.window.events.filter((e) =>
            e.name === EventName.OnCardDefeated &&
            EnumHelpers.isUnit(e.lastKnownInformation.type) &&
            e.lastKnownInformation.controller !== context.player
        );

        const defeatedUnitCost = event.lastKnownInformation.card.cost;
        const highestCostAmongDefeated = allDefeatedEnemyUnitEvents
            .map((event) => event.lastKnownInformation)
            .reduce((max, lki) => Math.max(max, lki.card.cost), 0);
        const highestCostAmongInPlay = context.game
            .getArenaUnits({ controller: context.player.opponent })
            .reduce((max, unit) => Math.max(max, unit.cost), 0);

        return defeatedUnitCost >= highestCostAmongInPlay && defeatedUnitCost >= highestCostAmongDefeated;
    }
}