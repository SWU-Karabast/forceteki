import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class BobaFettFamilyFound extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'boba-fett#family-found-id',
            internalName: 'boba-fett#family-found',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `Give it ${TextHelper.Raid(1)} and ${TextHelper.Saboteur} for this phase`,
            contextTitle: (context) => `Give ${TextHelper.Raid(1)} and ${TextHelper.Saboteur} to ${context.event.card.title} for this phase`,
            when: {
                onUnitEntersPlay: (event, context) =>
                    event.card.controller === context.player &&
                    event.card.hasSomeKeyword(KeywordName.Ambush)
            },
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                title: `Gains ${TextHelper.Raid(1)} and ${TextHelper.Saboteur} for the phase`,
                target: context.event.card,
                effect: [
                    abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 }),
                    abilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
                ]
            }))
        });
    }
}