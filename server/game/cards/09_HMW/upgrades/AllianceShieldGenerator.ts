import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { DamageModificationType } from '../../../core/Constants';

export default class AllianceShieldGenerator extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'alliance-shield-generator-id',
            internalName: 'alliance-shield-generator',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDamageModificationAbility({
            title: 'Prevent 5 or more damage to the attached base, then defeat this upgrade and draw a card',
            modificationType: DamageModificationType.Replace,
            shouldCardHaveDamageModification: (card, context) =>
                context.source.isUpgrade() &&
                context.source.parentCard?.isBase() &&
                card === context.source.parentCard &&
                this.wouldDealFiveOrMoreDamage(context),
            replaceWithEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.defeat(),
                AbilityHelper.immediateEffects.draw(),
            ]),
        });
    }

    private wouldDealFiveOrMoreDamage(context: TriggeredAbilityContext) {
        const event = context.event;
        const amount = event.amount ?? event.sourceEventForExcessDamage?.availableExcessDamage ?? 0;
        return amount >= 5;
    }
}
