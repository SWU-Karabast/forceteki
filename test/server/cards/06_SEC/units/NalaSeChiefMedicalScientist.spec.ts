describe('Nala Se, Chief Medical Scientist', function() {
    integration(function(contextRef) {
        const disclosePrompt = 'Disclose Vigilance, Vigilance. If you do, heal up to 4 damage from among other units';

        it('Nala Se\'s ability can heal up to 4 damage from other units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['takedown', 'vigilance', 'waylay'],
                    groundArena: [{ card: 'yoda#old-master', damage: 2 }, { card: 'battlefield-marine', damage: 0 }, { card: 'nala-se#chief-medical-scientist', damage: 2 }],
                    spaceArena: [{ card: 'alliance-xwing', damage: 1 }],
                    leader: { card: 'han-solo#worth-the-risk', deployed: true, damage: 4 },
                },
                player2: {
                    hand: ['cantina-bouncer', 'vanquish'],
                    groundArena: [{ card: 'atst', damage: 3 }],
                    spaceArena: [{ card: 'tieln-fighter', damage: 0 }],
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true, damage: 3 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.nalaSeChiefMedicalScientist);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePrompt(disclosePrompt);
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            expect(context.player1).toBeAbleToSelectExactly([
                context.takedown,
                context.vigilance
            ]);
            context.player1.clickCard(context.vigilance);
            context.player2.clickPrompt('Done');

            // select card to give healing
            expect(context.player1).toBeAbleToSelectExactly([
                context.yodaOldMaster,
                context.hanSoloWorthTheRisk,
                context.allianceXwing,
                context.battlefieldMarine,
                context.atst,
                context.tielnFighter,
                context.idenVersioInfernoSquadCommander
            ]);

            context.player1.setDistributeHealingPromptState(new Map([
                [context.yodaOldMaster, 2], // We can heal all damages
                [context.hanSoloWorthTheRisk, 1], // We can heal the leader unit
                [context.atst, 1] // We can heal opponent's unit
            ]));

            expect(context.yoda.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.hanSolo.damage).toBe(3);
            expect(context.allianceXwing.damage).toBe(1);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.tielnFighter.damage).toBe(0);
            expect(context.atst.damage).toBe(2);
            expect(context.idenVersioInfernoSquadCommander.damage).toBe(3);
            expect(context.nalaSeChiefMedicalScientist.damage).toBe(2);

            expect(context.getChatLogs(1)).toContain('player1 uses Nala Se to distribute 2 healing to Yoda, 1 healing to Han Solo, and 1 healing to AT-ST');

            // Reset Nala Se
            context.readyCard(context.nalaSeChiefMedicalScientist);
            context.player2.passAction();

            // We can heal less than 4 damage
            context.player1.clickCard(context.nalaSeChiefMedicalScientist);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePrompt(disclosePrompt);
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            expect(context.player1).toBeAbleToSelectExactly([
                context.takedown,
                context.vigilance
            ]);
            context.player1.clickCard(context.vigilance);
            context.player2.clickPrompt('Done');

            context.player1.setDistributeHealingPromptState(new Map([
                [context.idenVersioInfernoSquadCommander, 3],
            ]));

            expect(context.idenVersioInfernoSquadCommander.damage).toBe(0);

            expect(context.getChatLogs(1)).toContain('player1 uses Nala Se to distribute 3 healing to Iden Versio');

            // Reset Nala Se
            context.readyCard(context.nalaSeChiefMedicalScientist);
            context.player2.passAction();

            // We can heal 0 damage
            context.player1.clickCard(context.nalaSeChiefMedicalScientist);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePrompt(disclosePrompt);
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            expect(context.player1).toBeAbleToSelectExactly([
                context.takedown,
                context.vigilance
            ]);
            context.player1.clickCard(context.vigilance);
            context.player2.clickPrompt('Done');

            context.player1.setDistributeHealingPromptState(new Map([]));

            expect(context.yoda.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.hanSolo.damage).toBe(3);
            expect(context.allianceXwing.damage).toBe(1);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.tielnFighter.damage).toBe(0);
            expect(context.atst.damage).toBe(2);
            expect(context.idenVersioInfernoSquadCommander.damage).toBe(0);
            expect(context.nalaSeChiefMedicalScientist.damage).toBe(2);

            // Last reset to pass disclose
            context.readyCard(context.nalaSeChiefMedicalScientist);
            context.player2.passAction();

            context.player1.clickCard(context.nalaSeChiefMedicalScientist);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePrompt(disclosePrompt);
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            expect(context.player1).toBeAbleToSelectExactly([
                context.takedown,
                context.vigilance
            ]);
            context.player1.clickPrompt('Choose nothing');

            expect(context.yoda.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.hanSolo.damage).toBe(3);
            expect(context.allianceXwing.damage).toBe(1);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.tielnFighter.damage).toBe(0);
            expect(context.atst.damage).toBe(2);
            expect(context.idenVersioInfernoSquadCommander.damage).toBe(0);
            expect(context.nalaSeChiefMedicalScientist.damage).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });
    });
});