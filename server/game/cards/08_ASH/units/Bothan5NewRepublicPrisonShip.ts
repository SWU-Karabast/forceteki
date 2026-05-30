import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, ZoneName } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class Bothan5NewRepublicPrisonShip extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8459332679',
            internalName: 'bothan5#new-republic-prison-ship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'This unit captures the defeated unit from your discard pile',
            contextTitle: (context) => `${context.source.title} captures ${context.event.card.title} from your discard pile`,
            when: {
                onCardDefeated: (event, context) =>
                    EnumHelpers.isUnit(event.lastKnownInformation.type) &&
                    event.lastKnownInformation.controller === context.player &&
                    event.card !== context.source &&
                    !event.lastKnownInformation.traits?.has(Trait.Vehicle),
            },
            optional: true,
            limit: abilityHelper.limit.perRound(1),
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.card.zoneName === ZoneName.Discard,
                onTrue: abilityHelper.immediateEffects.capture((context) => ({
                    captor: context.source,
                    target: context.event.card,
                    fromOutOfPlay: true,
                }))
            })
        });
    }
}
