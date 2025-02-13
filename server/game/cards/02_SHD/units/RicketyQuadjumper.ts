import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RicketyQuadjumper extends NonLeaderUnitCard {
    protected override readonly overrideNotImplemented: boolean = true;

    protected override getImplementationId() {
        return {
            id: '7291903225',
            internalName: 'rickety-quadjumper'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Reveal a card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({ target: context.source.controller.getTopCardOfDeck(),
                useDisplayPrompt: true })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give an Experience token to another unit.',
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: !ifYouDoContext.events[0].cards[0].isUnit(),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        cardCondition: (card, context) => card !== context.source,
                        innerSystem: AbilityHelper.immediateEffects.giveExperience(),
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            })
        });
    }
}

RicketyQuadjumper.implemented = true;