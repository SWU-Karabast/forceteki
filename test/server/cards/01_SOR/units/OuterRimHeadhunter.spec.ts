describe('Outer Rim Headhunter', function () {
    integration(function (contextRef) {
        describe('Outer Rim Headhunter\'s On Attack ability', function () {
            it('should exhaust a non-leader unit if you control a deployed leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outer-rim-headhunter'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'scout-bike-pursuer']
                    }
                });

                const { context } = contextRef;

                // attack with Outer Rim Headhunter
                context.player1.clickCard(context.outerRimHeadhunter);
                context.player1.clickCard(context.p2Base);

                // can target all non leader unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.outerRimHeadhunter, context.scoutBikePursuer]);
                expect(context.player1).toHavePassAbilityButton();

                // choose battlefield marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.chirrutImwe.exhausted).toBeFalse();
                expect(context.scoutBikePursuer.exhausted).toBeFalse();
            });

            it('should not exhaust any unit if you do not control a deployed leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outer-rim-headhunter'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // attack with Outer Rim Headhunter
                context.player1.clickCard(context.outerRimHeadhunter);
                context.player1.clickCard(context.p2Base);

                // no ability to resolve, it is now P2's turn
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.exhausted).toBeFalse();
            });

            it('works when you control a pilot leader upgrade that makes attached unit a leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        spaceArena: ['outer-rim-headhunter', 'n1-starfighter']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                // Deploy Kazuda Xiono as a pilot on N-1 Starfighter
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Deploy Kazuda Xiono as a Pilot');
                context.player1.clickCard(context.n1Starfighter);
                context.player2.passAction();

                // Now attack with Outer Rim Headhunter
                context.player1.clickCard(context.outerRimHeadhunter);
                context.player1.clickCard(context.p2Base);

                // Can target all non leader units
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.outerRimHeadhunter]);
                expect(context.player1).toHavePassAbilityButton();

                // Choose battlefield marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBeTrue();
            });

            it('does not work when you control a pilot leader upgrade that does not make attached unit a leader', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['outer-rim-headhunter', 'green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                // Attach Poe as a pilot on Green Squadron A-Wing
                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.passAction();

                // Now attack with Outer Rim Headhunter
                context.player1.clickCard(context.outerRimHeadhunter);
                context.player1.clickCard(context.p2Base);

                // No ability to resolve, it is now P2's turn
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
