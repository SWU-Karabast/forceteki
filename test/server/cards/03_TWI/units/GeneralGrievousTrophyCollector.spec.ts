describe('General Grievous, Trophy Collector', function () {
    integration(function (contextRef) {
        it('General Grievous ability should ignore aspect penalty for Lightsaber you play on him and defeat 4 units if he has 4 or more Lightsaber', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fallen-lightsaber', 'jedi-lightsaber', 'mace-windus-lightsaber', 'lukes-lightsaber', 'ahsokas-padawan-lightsaber', 'shadowed-intentions'],
                    groundArena: ['general-grievous#trophy-collector', 'consular-security-force'],
                    leader: 'qira#i-alone-survived',
                    resources: 30,
                    base: 'echo-base'
                },
                player2: {
                    groundArena: ['battlefield-marine', 'wampa'],
                    spaceArena: ['restored-arc170', 'green-squadron-awing'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            // play a lightsaber on another unit, should not ignore aspect penalty
            context.player1.clickCard(context.lukesLightsaber);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);
            context.player2.passAction();

            // play a non-lightsaber upgrade on grievous, should not ignore aspect penalty
            context.player1.clickCard(context.shadowedIntentions);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(9);
            context.player2.passAction();

            // play a lightsaber upgrade on grievous, should ignore aspect penalty
            context.player1.clickCard(context.fallenLightsaber);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(12);
            context.player2.passAction();

            context.player1.clickCard(context.jediLightsaber);
            context.player1.clickCard(context.generalGrievous);

            // play a lightsaber upgrade on grievous, should ignore aspect penalty
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(15);
            context.player2.passAction();

            context.player1.clickCard(context.ahsokasPadawanLightsaber);
            context.player1.clickCard(context.generalGrievous);

            // play a lightsaber upgrade on grievous, should ignore aspect penalty
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(16);
            context.player2.passAction();

            // attack with grievous, he does not have 4 lightsaber upgrade, no ability
            context.player1.clickCard(context.generalGrievous);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();
            context.setDamage(context.p2Base, 0);
            context.generalGrievous.exhausted = false;

            // play a lightsaber upgrade on grievous, should ignore aspect penalty
            context.player1.clickCard(context.maceWindusLightsaber);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(18);
            context.player2.passAction();

            // attack with grievous, he has 4 lightsaber upgrade, his ability should kill 4 units
            context.player1.clickCard(context.generalGrievous);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.lukeSkywalker, context.restoredArc170, context.greenSquadronAwing]);
            expect(context.player1).not.toHaveEnabledPromptButtons(['Done']);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).not.toHaveEnabledPromptButtons(['Done']);
            context.player1.clickCard(context.wampa);
            expect(context.player1).not.toHaveEnabledPromptButtons(['Done']);
            context.player1.clickCard(context.lukeSkywalker);
            expect(context.player1).not.toHaveEnabledPromptButtons(['Done']);
            context.player1.clickCard(context.restoredArc170);
            expect(context.player1).toHaveEnabledPromptButtons(['Done']);
            context.player1.clickCardNonChecking(context.greenSquadronAwing);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toBeInZone('spaceArena');
            expect([context.battlefieldMarine, context.wampa, context.restoredArc170]).toAllBeInZone('discard');
            expect(context.lukeSkywalker.deployed).toBeFalse();

            context.setDamage(context.p2Base, 0);
            context.generalGrievous.exhausted = false;
            context.player2.passAction();

            // attack with grievous, he has 4 lightsaber upgrade, his ability should kill 4 units but can defeat only 1 unit
            context.player1.clickCard(context.generalGrievous);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing]);
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.greenSquadronAwing).toBeInZone('discard');
        });
    });
});
