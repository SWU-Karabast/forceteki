import AbilityHelper from '../../../AbilityHelper';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class TwinLaserTurret extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9981313319',
            internalName: 'twin-laser-turret'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card: Card) => card.hasSomeTrait(Trait.Vehicle));

        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Deal 1 damage to each of up to 2 units in this arena.',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zoneName === context.source.zoneName,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}
