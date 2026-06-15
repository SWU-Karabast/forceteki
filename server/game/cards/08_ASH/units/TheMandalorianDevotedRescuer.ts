import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageModificationType } from '../../../core/Constants';
import type Shield from '../../01_SOR/tokens/Shield';

export default class TheMandalorianDevotedRescuer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1288292674',
            internalName: 'the-mandalorian#devoted-rescuer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDamageModificationAbility({
            title: 'Defeat a Shield attached to The Mandalorian to prevent all damage to a friendly unit',
            contextTitle: (context) => `Defeat a Shield attached to ${context.source.title} to prevent all damage to ${context.event.card.title}`,
            modificationType: DamageModificationType.PreventAll,
            optional: true,
            shouldCardHaveDamageModification: (card, context) =>
                card.isUnit() && card.controller === context.player && card !== context.source,
            onlyIfYouDoEffect: AbilityHelper.immediateEffects.defeat((context) => {
                // Auto-select the shield to defeat, preferring highPriorityRemoval (Jetpack) shields.
                const shields = context.source.isUnit()
                    ? context.source.upgrades.filter((u): u is Shield => u.isShield())
                    : [];
                const target = shields.find((s) => s.highPriorityRemoval) ?? shields[0];
                return { target: target ?? undefined };
            })
        });
    }
}
