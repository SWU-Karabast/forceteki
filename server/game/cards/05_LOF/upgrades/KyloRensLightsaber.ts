import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import { ExhaustSourceType } from '../../../IDamageOrDefeatSource';

export default class KyloRensLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1637958279',
            internalName: 'kylo-rens-lightsaber',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        card.addReplacementEffectAbilityTargetingAttached({
            title: 'This unit can\'t be exhausted by enemy card abilities',
            gainCondition: (context) => context.source.parentCard?.hasSomeTrait(Trait.Force),
            when: {
                onCardExhausted: (event, context) =>
                    event.card === context.source &&
                    event.exhaustSource.type === ExhaustSourceType.Ability &&
                    event.exhaustSource.player !== context.player,
            }
        });
    }
}