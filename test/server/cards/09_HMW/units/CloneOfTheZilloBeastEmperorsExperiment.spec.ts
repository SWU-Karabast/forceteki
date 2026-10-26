describe('Clone of the Zillo Beast, Emperor\'s Experiment', function() {
    integration(function(contextRef) {
        it('should give other friendly units -2/-2', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['clone-of-the-zillo-beast#emperors-experiment', 'wampa', 'battlefield-marine'],
                    spaceArena: ['green-squadron-awing'],
                    hand: ['traitorous']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['rampart#enjoy-the-exit']
                }
            });

            const { context } = contextRef;

            // The Zillo Beast itself is unaffected
            expect(context.cloneOfTheZilloBeast.getPower()).toBe(6);
            expect(context.cloneOfTheZilloBeast.getHp()).toBe(6);

            // Other friendly units get -2/-2
            expect(context.wampa.getPower()).toBe(2);
            expect(context.wampa.getHp()).toBe(3);
            expect(context.battlefieldMarine.getPower()).toBe(1);
            expect(context.battlefieldMarine.getHp()).toBe(1);
            expect(context.greenSquadronAwing.getPower()).toBe(0);
            expect(context.greenSquadronAwing.getHp()).toBe(1);

            // Enemy units are unaffected
            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);

            context.player1.clickCard(context.traitorous);
            context.player1.clickCard(context.rampart);

            // Stolen unit are affected
            expect(context.rampart.getPower()).toBe(1);
            expect(context.rampart.getHp()).toBe(1);
        });

        it('should give a Weakness token to a unit on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['clone-of-the-zillo-beast#emperors-experiment', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.cloneOfTheZilloBeast);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.cloneOfTheZilloBeast, context.battlefieldMarine, context.atst]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.atst);

            expect(context.atst).toHaveExactUpgradeNames(['weakness']);
            expect(context.atst.getPower()).toBe(5);
            expect(context.atst.getHp()).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
