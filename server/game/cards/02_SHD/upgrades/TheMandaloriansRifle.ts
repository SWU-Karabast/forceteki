import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class TheMandaloriansRifle extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0754286363',
            internalName: 'the-mandalorians-rifle',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) =>
            !context.target.hasSomeTrait(Trait.Vehicle) &&
            context.target.controller === context.player
        );

        registrar.addWhenPlayedAbility({
            title: 'If attached unit is The Mandalorian, he captures an exhausted enemy non-leader unit',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.parentCard.title === 'The Mandalorian',
                    onTrue: AbilityHelper.immediateEffects.capture((context) => ({
                        captor: context.source.parentCard
                    }))
                })
            }
        });
    }
}
