// describe('Hotshot DL-44 Blaster', function() {
//     integration(function() {
//         describe('Hotshot DL-44 Blaster\'s ability', function() {
//             beforeEach(function () {
//                 this.setupTest({
//                     phase: 'action',
//                     player1: {
//                         groundArena: ['battlefield-marine'],
//                         spaceArena: ['collections-starhopper'],
//                         hand: ['hotshot-dl44-blaster']
//                     },
//                     base: 'tarkintown'
//                 });
//             });

//             it('does not initiate an attack when played from hand', function () {
//                 this.player1.clickCard(this.hotshotDl44Blaster);
//                 expect(this.player2).toBeActivePlayer();
//                 expect(this.hotshotDl44Blaster).toBeInLocation('ground arena');
//                 expect(this.battlefieldMarine.exhausted).toBe(false);
//                 expect(this.battlefieldMarine.power).toBe(5);
//                 expect(this.battlefieldMarine.hp).toBe(3);
//             });
//         });

//         describe('Hotshot DL-44 Blaster\'s ability', function() {
//             beforeEach(function () {
//                 this.setupTest({
//                     phase: 'action',
//                     player1: {
//                         hand: [],
//                         groundArena: ['battlefield-marine'],
//                         spaceArena: ['collections-starhopper'],
//                         resources: ['hotshot-dl44-blaster', 'atst', 'atst', 'atst', 'atst', 'atst']
//                     }
//                 });
//             });

//             it('initiates an attack with the upgraded unit when Smuggled', function () {
//                 this.player1.clickCard(this.hotshotDl44Blaster);
//                 expect(this.player2).toBeActivePlayer();
//                 expect(this.hotshotDl44Blaster).toBeInLocation('ground arena');
//                 expect(this.battlefieldMarine.exhausted).toBe(true);
//                 expect(this.p2Base.damage).toBe(5);
//                 expect(this.battlefieldMarine.power).toBe(5);
//                 expect(this.battlefieldMarine.hp).toBe(3);
//             });
//         });
//     });
// });
