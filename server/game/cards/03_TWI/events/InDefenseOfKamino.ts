import AbilityHelper from '../../../AbilityHelper';
import { AbilityType, KeywordName, Trait } from '../../../core/Constants';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class InDefenseOfKamino extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1272825113',
            internalName: 'in-defense-of-kamino',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'For this phase, each friendly Republic unit gains Restore 2 and: "When Defeated: Create a Clone Trooper token"',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: [
                    AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 }),
                    AbilityHelper.ongoingEffects.gainAbility({
                        type: AbilityType.Triggered,
                        title: 'Create a Clone Trooper token',
                        when: { whenDefeated: true },
                        immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
                    })
                ],
                target: context.player.getArenaUnits({ trait: Trait.Republic })
            }))
        });
    }
}
