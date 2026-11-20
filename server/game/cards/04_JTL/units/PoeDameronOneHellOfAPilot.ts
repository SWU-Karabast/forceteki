import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';
import type { ICardStateGetter } from '../../../core/lki/CardStateGetter';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class PoeDameronOneHellOfAPilot extends NonLeaderUnitCard {
    public override readonly usesLkiRegistry = true;

    protected override getImplementationId () {
        return {
            id: '8757741946',
            internalName: 'poe-dameron#one-hell-of-a-pilot',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper, cardStates: ICardStateGetter) {
        registrar.addWhenPlayedAbility({
            title: 'Create an X-Wing token',
            immediateEffect: AbilityHelper.immediateEffects.createXWing({
                amount: 1
            }),
            then: (thenContext) => ({
                title: `Attach this unit as an upgrade to a friendly ${TextHelper.Trait.Vehicle} unit without a ${TextHelper.Trait.Pilot} on it`,
                optional: true,
                // Whether Poe is still in play now. He may have left play earlier in this resolution, for
                // example defeated while attacking with Ambush, so this asks the current view.
                thenCondition: (context) => cardStates.getCurrentProperties(context.source).isInPlay(),
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && !card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot)),
                    immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                        upgrade: context.source,
                    })),
                }
            })
        });
    }
}
