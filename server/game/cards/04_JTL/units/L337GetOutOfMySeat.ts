import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, RelativePlayer, TargetMode, Trait } from '../../../core/Constants';

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
                title: 'Attach it to a friendly Vehicle unit without a Pilot on it',
                type: AbilityType.Triggered,
                when: {
                    onCardDefeated: (event, context) => event.card === context.source,
                },
                optional: true,
                targetResolver: {
                    mode: TargetMode.Single,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && !card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot)),
                    immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                        target: context.target,
                        upgrade: this, // context.source is better but does not work because not IInPlayCard
                    }))
                }
            }),
        });
    }
}
