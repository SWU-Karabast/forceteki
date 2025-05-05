import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class ObiWanKenobiCourageMakesHeroes extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2693401411',
            internalName: 'obiwan-kenobi#courage-makes-heroes',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Give an Experience token to a unit without an Experience token on it',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.useTheForce()
            ],
            targetResolver: {
                cardCondition: (card) => card.isUnit() && !card.hasExperience(),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Give an Experience token to another unit without an Experience token on it',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card.isUnit() &&
                  card !== context.source &&
                  !card.hasExperience(),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}