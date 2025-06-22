import AbilityHelper from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer, Trait } from '../../../core/Constants';

export default class L337GetOutOfMySeat extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6032641503',
            internalName: 'l337#get-out-of-my-seat',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'If this unit would be defeated, you may instead attach her as an upgrade to a friendly Vehicle unit without a Pilot on it.',
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility({
                title: 'Attach to a friendly Vehicle unit without a pilot on it',
                type: AbilityType.ReplacementEffect,
                when: {
                    onCardDefeated: (event, context) => event.card === context.source,
                },
                optional: true,
                replaceWith: {
                    replacementImmediateEffect: AbilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && !card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot)),
                        immediateEffect: AbilityHelper.immediateEffects.attachUpgrade<TriggeredAbilityContext<this>>((context) => ({
                            target: context.target,
                            upgrade: context.source
                        }))
                    }),
                },
                effect: '{1}\'s ability attaches it to a vehicle unit instead of being defeated',
                effectArgs: (context) => [context.source],
            })
        });
    }
}
