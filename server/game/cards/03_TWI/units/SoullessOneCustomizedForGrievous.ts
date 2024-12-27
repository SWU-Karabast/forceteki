import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class SoullessOneCustomizedForGrievous extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6406254252',
            internalName: 'soulless-one#customized-for-grievous',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Exhaust a friendly Droid unit or General Grievous',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) =>
                    card.controller === context.source.controller &&
                    (card.hasSomeTrait(Trait.Droid) || card.title === 'General Grievous'),
                immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            },
            ifYouDo: {
                title: 'This unit gets +2/+0 for this attack',
                immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })
            },
        });
    }
}

SoullessOneCustomizedForGrievous.implemented = true;
