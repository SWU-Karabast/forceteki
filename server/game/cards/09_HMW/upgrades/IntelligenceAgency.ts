import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class IntelligenceAgency extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'intelligence-agency-id',
            internalName: 'intelligence-agency',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainConstantAbilityTargetingAttached({
            title: 'You may look at the top card of your deck at any time',
            gainCondition: (context) => context.source.parentCard?.isBase(),
            ongoingEffect: abilityHelper.ongoingEffects.canLookAtTopOfDeck()
        });

        registrar.addWhenPlayedAbility({
            title: 'Look at an opponent\'s hand',
            immediateEffect: abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                target: context.player.opponent.hand,
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.discardSpecificCard(),
                    abilityHelper.immediateEffects.draw((context) => ({ target: context.player.opponent }))
                ])
            }))
        });
    }
}
