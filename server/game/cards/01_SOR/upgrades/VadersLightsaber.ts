import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { ZoneName, Trait, WildcardCardType } from '../../../core/Constants';

export default class VadersLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0705773109',
            internalName: 'vaders-lightsaber',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Deal 4 damage to a ground unit',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.parentCard?.title === 'Darth Vader',
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 4 }),
                })
            }
        });
    }
}
