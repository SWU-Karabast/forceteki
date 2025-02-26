import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class PrecisionFire extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9210902604',
            internalName: 'precision-fire',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Attack with a unit. It gains Saboteur for this attack. If it’s a Trooper, it also gets +2/+0 for this attack.',
            initiateAttack: {
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur) },
                    {
                        condition: (_, context) => context.source.hasSomeTrait(Trait.Trooper),
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    },
                ],
            }
        });
    }
}
