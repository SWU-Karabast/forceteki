import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { ZoneName } from '../../../core/Constants';

export default class TrapField extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'trap-field-id',
            internalName: 'trap-field',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat this upgrade to deal 3 damage to that unit',
            contextTitle: (context) => `Defeat this upgrade to deal 3 damage to ${context.event.card.title}`,
            when: {
                onUnitEntersPlay: (event) =>
                    event.card.isNonLeaderUnit() &&
                    event.card.zoneName === ZoneName.GroundArena
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.defeat((context) => ({ target: context.source })),
            ifYouDo: {
                title: 'Deal 3 damage to that unit',
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                    amount: 3,
                    target: context.event.card,
                }))
            }
        });
    }
}
