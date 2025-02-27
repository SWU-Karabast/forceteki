describe('Nute Gunray, Vindictive Viceroy', function () {
    integration(function (contextRef) {
        describe('Nute Gunray\'s leader undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'rogue-squadron-skirmisher'],
                        spaceArena: ['green-squadron-awing'],
                        hand: ['takedown'],
                        leader: 'nute-gunray#vindictive-viceroy',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['academy-defense-walker', 'superlaser-technician'],
                        spaceArena: ['confederate-trifighter'],
                        hasInitiative: true
                    },
                });
            });

            it('should create a battledroid token if two or more friendly units defeated this phase', function () {
                const { context } = contextRef;

                // 2 friendly units defeated
                context.player2.clickCard(context.confederateTrifighter);
                context.player2.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.academyDefenseWalker);
                expect(context.greenSquadronAwing).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                context.player2.claimInitiative();

                // create a battledroid token
                context.player1.clickCard(context.nuteGunray);
                expect(context.nuteGunray.exhausted).toBeTrue();
                const battleDroid = context.player1.findCardsByName('battle-droid');
                expect(battleDroid.length).toBe(1);
                expect(battleDroid[0]).toBeInZone('groundArena');
                expect(battleDroid.every((batDroid) => batDroid.exhausted)).toBeTrue();
                context.moveToNextActionPhase();

                // 1 friendly unit defeated and 2 enemy units
                context.player2.clickCard(context.superlaserTechnician);
                context.player2.clickCard(context.rogueSquadronSkirmisher);
                context.player2.passAction();
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.academyDefenseWalker);
                context.player2.claimInitiative();
                context.player1.clickCard(context.nuteGunray);
                expect(context.nuteGunray.exhausted).toBeTrue();

                // battledroid already on field, another not created as condiiton not met
                expect(context.player1.findCardsByName('battle-droid').length).toBe(1);
            });
        });

        describe('Nute Gunray\'s leader deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'nute-gunray#vindictive-viceroy', deployed: true },
                    },
                    player2: {
                        groundArena: ['admiral-yularen#advising-caution'],
                    },
                });
            });

            it('should create a battledroid token on attack', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.nuteGunray);
                context.player1.clickCard(context.admiralYularen);
                const battleDroid = context.player1.findCardsByName('battle-droid');
                expect(battleDroid.length).toBe(1);
                expect(battleDroid[0]).toBeInZone('groundArena');
            });
        });
    });
});
