const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');
const { TargetModes } = require('../../../Constants.js');

class CommuneWithTheSpirits extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Claim a ring',
            target: {
                mode: TargetModes.Ring,
                activePromptTitle: 'Choose an unclaimed ring',
                ringCondition: ring => ring.isUnclaimed(),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.takeFateFromRing(context => ({
                        target: context.ring,
                        amount: context.ring.fate,
                        removeOnly: true
                    })),
                    AbilityDsl.actions.claimRing({ takeFate: false, type: 'political'})
                ])
            },
            max: AbilityDsl.limit.perRound(1),
            effect: 'discard all fate from the {0} and claim it as a political ring'
        });
    }
}

CommuneWithTheSpirits.id = 'commune-with-the-spirits';
module.exports = CommuneWithTheSpirits;
