import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { PhaseName } from '../../../core/Constants';

export default class BeastLair extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'beast-lair-id',
            internalName: 'beast-lair',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Discard a card from your hand to create a Beast token',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Action
            },
            gainCondition: (context) => context.source.parentCard?.isBase(),
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                target: context.player,
                amount: 1
            })),
            ifYouDo: {
                title: 'Create a Beast token',
                immediateEffect: abilityHelper.immediateEffects.createBeast()
            }
        });
    }
}
