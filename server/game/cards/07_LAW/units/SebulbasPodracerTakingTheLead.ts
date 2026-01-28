import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class SebulbasPodracerTakingTheLead extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'sebulbas-podracer#taking-the-lead-id',
            internalName: 'sebulbas-podracer#taking-the-lead',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Ready this unit',
            contextTitle: (context) => `Ready ${context.source.title}`,
            optional: true,
            limit: AbilityHelper.limit.perRound(1),
            when: {
                onCardDiscarded: (event, context) =>
                    event.card.owner === context.player &&
                    event.discardedFromZone === ZoneName.Deck
            },
            immediateEffect: AbilityHelper.immediateEffects.ready()
        });
    }
}