// describe('Count Dooku, Face of the Confederacy', function () {
//     integration(function (contextRef) {
//         describe('Count Dooku\'s leader undeployed ability', function () {
//             beforeEach(function () {
//                 contextRef.setupTest({
//                     phase: 'action',
//                     player1: {
//                         hand: ['droideka-security', 'generals-guardian', 'pyke-sentinel'],
//                         groundArena: ['battle-droid', 'atst', 'snowspeeder'],
//                         spaceArena: ['cartel-spacer'],
//                         leader: 'count-dooku#face-of-the-confederacy',
//                         base: 'capital-city',
//                         resources: 6
//                     }
//                 });
//             });

//             it('should play a Separatist card from hand that does not already have Exploit and give it Exploit 1', function () {
//                 const { context } = contextRef;

//                 context.player1.clickCard(context.countDooku);
//                 expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.generalsGuardian]);
//                 context.player1.clickCard(context.generalsGuardian);
//                 expect(context.player1).toHaveExactPromptButtons(['Play General\'s Guardian', 'Play General\'s Guardian using Exploit']);

//                 context.player1.clickPrompt('Play General\'s Guardian using Exploit');
//                 expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer]);
//                 expect(context.player1).not.toHaveEnabledPromptButton('Done');

//                 // Exploit selection
//                 context.player1.clickCard(context.battleDroid);
//                 expect(context.player1).toHaveEnabledPromptButton('Done');
//                 // extra click on AT-ST to confirm that the Exploit limit is 1
//                 context.player1.clickCardNonChecking(context.atst);
//                 context.player1.clickPrompt('Done');

//                 // confirm Exploit results
//                 expect(context.battleDroid).toBeInZone('outsideTheGame');
//                 expect(context.atst).toBeInZone('groundArena');
//                 expect(context.generalsGuardian).toBeInZone('groundArena');
//                 expect(context.player1.exhaustedResourceCount).toBe(2);
//             });

//             it('should play a Separatist card from hand that has Exploit and give it an additional Exploit 1', function () {
//                 const { context } = contextRef;

//                 context.player1.clickCard(context.countDooku);
//                 expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.generalsGuardian]);
//                 context.player1.clickCard(context.droidekaSecurity);
//                 expect(context.player1).toHaveExactPromptButtons(['Play Droideka Security', 'Play Droideka Security using Exploit']);

//                 context.player1.clickPrompt('Play Droideka Security using Exploit');
//                 expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer]);
//                 expect(context.player1).not.toHaveEnabledPromptButton('Done');

//                 // Exploit selection
//                 context.player1.clickCard(context.battleDroid);
//                 expect(context.player1).toHaveEnabledPromptButton('Done');
//                 context.player1.clickCard(context.snowspeeder);
//                 context.player1.clickCard(context.cartelSpacer);
//                 // extra click on AT-ST to confirm that the Exploit limit is 3
//                 context.player1.clickCardNonChecking(context.atst);
//                 context.player1.clickPrompt('Done');

//                 // confirm Exploit results
//                 expect(context.battleDroid).toBeInZone('outsideTheGame');
//                 expect(context.snowspeeder).toBeInZone('discard');
//                 expect(context.cartelSpacer).toBeInZone('discard');
//                 expect(context.atst).toBeInZone('groundArena');
//                 expect(context.droidekaSecurity).toBeInZone('groundArena');
//                 expect(context.player1.exhaustedResourceCount).toBe(0);
//             });

//             it('should play a Separatist card from hand that does not already have Exploit and give it Exploit 1 as the required play option if there are not enough resources for standard play', function () {
//                 const { context } = contextRef;

//                 context.player1.exhaustResources(4);

//                 context.player1.clickCard(context.countDooku);
//                 expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.generalsGuardian]);
//                 context.player1.clickCard(context.generalsGuardian);

//                 // go directly to Exploit selection since there are too few resources for standard play
//                 expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.atst, context.snowspeeder, context.cartelSpacer]);
//                 expect(context.player1).not.toHaveEnabledPromptButton('Done');

//                 // Exploit selection
//                 context.player1.clickCard(context.battleDroid);
//                 expect(context.player1).toHaveEnabledPromptButton('Done');
//                 // extra click on AT-ST to confirm that the Exploit limit is 1
//                 context.player1.clickCardNonChecking(context.atst);
//                 context.player1.clickPrompt('Done');

//                 // confirm Exploit results
//                 expect(context.battleDroid).toBeInZone('outsideTheGame');
//                 expect(context.atst).toBeInZone('groundArena');
//                 expect(context.generalsGuardian).toBeInZone('groundArena');
//                 expect(context.player1.exhaustedResourceCount).toBe(6);
//             });
//         });

//         it('Count Dooku\'s leader undeployed ability should default to standard play if there are no units available to exploit', function () {
//             contextRef.setupTest({
//                 phase: 'action',
//                 player1: {
//                     hand: ['droideka-security', 'generals-guardian', 'pyke-sentinel'],
//                     leader: 'count-dooku#face-of-the-confederacy',
//                     base: 'capital-city',
//                     resources: 6
//                 }
//             });

//             const { context } = contextRef;

//             context.player1.clickCard(context.countDooku);
//             expect(context.player1).toBeAbleToSelectExactly([context.droidekaSecurity, context.generalsGuardian]);
//             context.player1.clickCard(context.generalsGuardian);

//             expect(context.generalsGuardian).toBeInZone('groundArena');
//             expect(context.player2).toBeActivePlayer();
//         });

//         // describe('Wat Tambor\'s leader deployed ability', function () {
//         //     beforeEach(function () {
//         //         contextRef.setupTest({
//         //             phase: 'action',
//         //             player1: {
//         //                 groundArena: ['battlefield-marine', 'guardian-of-the-whills'],
//         //                 spaceArena: ['green-squadron-awing'],
//         //                 leader: { card: 'wat-tambor#techno-union-foreman', deployed: true },
//         //             },
//         //             player2: {
//         //                 groundArena: ['admiral-yularen#advising-caution', 'alliance-dispatcher'],
//         //             },

//         //             // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
//         //             autoSingleTarget: true
//         //         });
//         //     });

//         //     it('should give +2/+2 to a unit for the phase because a friendly unit was defeat this phase', function () {
//         //         const { context } = contextRef;

//         //         // no unit killed, on attack ability should not trigger
//         //         context.player1.clickCard(context.watTambor);
//         //         context.player1.clickCard(context.allianceDispatcher);
//         //         expect(context.player2).toBeActivePlayer();
//         //         context.watTambor.exhausted = false;

//         //         // yularen kill our guardian of the whills
//         //         context.player2.clickCard(context.admiralYularen);
//         //         context.player2.clickCard(context.guardianOfTheWhills);

//         //         // wat tambor should give +2/+2 to any unit
//         //         context.player1.clickCard(context.watTambor);
//         //         context.player1.clickCard(context.p2Base);
//         //         expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.admiralYularen]);
//         //         expect(context.player1).toHavePassAbilityButton();

//         //         // give +2/+2 to battlefield marine
//         //         context.player1.clickCard(context.battlefieldMarine);
//         //         expect(context.player2).toBeActivePlayer();
//         //         expect(context.battlefieldMarine.getPower()).toBe(5);
//         //         expect(context.battlefieldMarine.getHp()).toBe(5);

//         //         // kill yularen (5 hp)
//         //         context.setDamage(context.admiralYularen, 0);
//         //         context.player2.passAction();
//         //         context.player1.clickCard(context.battlefieldMarine);
//         //         context.player1.clickCard(context.admiralYularen);
//         //         expect(context.admiralYularen).toBeInZone('discard');

//         //         // on next phase +2/+2 is gone
//         //         context.moveToNextActionPhase();
//         //         expect(context.battlefieldMarine.getPower()).toBe(3);
//         //         expect(context.battlefieldMarine.getHp()).toBe(3);
//         //     });
//         // });
//     });
// });
