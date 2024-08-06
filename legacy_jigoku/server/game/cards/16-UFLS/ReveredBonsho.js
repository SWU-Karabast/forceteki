const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class ReveredBonsho extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.customFatePhaseFateRemoval((player, fate) => {
                let context = this.game.getFrameworkContext();
                const ringsBase = [this.game.rings.air, this.game.rings.earth, this.game.rings.fire, this.game.rings.void, this.game.rings.water];
                let rings = ringsBase.filter(a => a.isUnclaimed());
                if(rings.length <= 0) {
                    return;
                }
                let ringFate = rings.map(ring => ({
                    ring: ring,
                    fate: 0
                }));

                while(fate >= rings.length) {
                    ringFate.forEach(a => a.fate++);
                    fate = fate - rings.length;
                }

                if(fate <= 0) {
                    this.placeFate(context, player, ringFate);
                    return;
                }

                let ringHandler = (player, ring) => {
                    const obj = ringFate.find(a => a.ring === ring);
                    obj.fate++;
                    fate--;
                    rings = rings.filter(a => a !== ring);
                    if(fate > 0) {
                        this.game.promptForRingSelect(player, {
                            activePromptTitle: 'Choose a ring to receive fate',
                            context: context,
                            ringCondition: ring => rings.includes(ring),
                            onSelect: ringHandler
                        });
                    }
                    return true;
                };

                this.game.promptForRingSelect(player, {
                    activePromptTitle: 'Choose a ring to receive fate',
                    context: context,
                    ringCondition: ring => rings.includes(ring),
                    onSelect: ringHandler
                });

                context.game.queueSimpleStep(() => this.placeFate(context, player, ringFate));
            })
        });
    }

    placeFate(context, targetPlayer, ringFate) {
        const moveEvents = [];
        ringFate.forEach(obj => {
            if(obj.fate > 0) {
                context.game.actions.placeFate({ target: obj.ring, amount: obj.fate }).addEventsToArray(moveEvents, context);
                context.game.addMessage('{0} places {1} fate on the {2} due to the effects of {3}', targetPlayer, obj.fate, obj.ring, this);
            }
        });
        context.game.openThenEventWindow(moveEvents);
    }
}

ReveredBonsho.id = 'revered-bonsho';

module.exports = ReveredBonsho;
