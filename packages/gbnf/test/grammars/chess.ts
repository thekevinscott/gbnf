export const grammar = `
# Specifies chess moves as a list in algebraic notation, using PGN conventions

# Force first move to "1. ", then any 1-2 digit number after, relying on model to follow the pattern
root    ::= "1. " move " " move "\n" ([1-9] [0-9]? ". " move " " move "\n")+
move    ::= (pawn | nonpawn | castle) [+#]?

# piece type, optional file/rank, optional capture, dest file & rank
nonpawn ::= [NBKQR] [a-h]? [1-8]? "x"? [a-h] [1-8]

# optional file & capture, dest file & rank, optional promotion
pawn    ::= ([a-h] "x")? [a-h] [1-8] ("=" [NBKQR])?

castle  ::= "O-O" "-O"?
`;
export const testCases = [
  "1",
  "1.",
  "1. a",
  "1. N1x",
  "1. a1+ a",
  "1. N1xh1",
  "1. a1+ a2+",
  "1. N1xh1+ N2",
  "1. a1+ a2+\n2.",
  "1. a2+ b3\n2. a",
  "1. a2+ b3\n2. a2",
  "1. a1 b2\n2. a1 b2",
  "1. f1=N f2=N\n2. f",
  "1. a1 b2\n2. a1 b2\n3",
  "1. a2+ b3\n2. a2+ b4\n3.",
  "1. a2+ b3\n2. a2+ b3\n3.",
  "1. N2xh3+ h4=N\n2. N2xh3",
  "1. N2xh3+ h4=N\n2. N2xh3+",
  "1. N2xh1+ N2xh2+\n2. N2xh1",
  "1. N2xh1+ N2xh2+\n2. N2xh1+",
  "1. a4 b5\n2. a3 b4\n3. a4 b4",
  "1. Ref1 Ref2\n2. Ref3 Ref4\n3",
  "1. a3+ c4+\n2. a3+ b5+\n3. d2+",
  "1. a2+ b3\n2. a2+ b3\n3. a2+ b3",
  "1. N1d2 N3f4\n2. f1+ N2e2\n3. f1+ N",
  "1. N1xg1+ N2xg2+\n2. N1xg1+ N2xg2+",
  "1. a1+ a2+\n2. a1+ a2+\n3. a1+ a2+\n4",
  "1. N2xb3+ N4xa2\n2. N5xb1+ N6xb2\n3.",
  "1. a4+ a5\n2. a4+ a6\n3. a4+ a7\n4. a4+",
  "1. a4+ b3\n2. a5+ b4\n3. a6+ b5\n4. a7+ b",
  "1. a4+ a5\n2. a4+ a6\n3. a4+ a7\n4. a4+ a",
  "1. a1+ a2\n2. b1+ b2\n3. c1+ c2\n4. d1+ d2",
  "1. a1+ b2=N\n2. c1+ d2=N\n3. e1+ f2=N\n4. g1+",
  "1. N2xh2+ N3xh3\n2. N2xh2+ N4xh4\n3. N2xh2+ N",
  "1. a1 b2\n2. a1 a2\n3. a1 b2\n4. a1 a2\n5. a1 b2\n6",
  "1. a4+ b3\n2. a4+ b3\n3. a4+ b3\n4. a4+ b3\n5. a4+ b",
  "1. a2+ b3\n2. a2+ b3\n3. a2+ b3\n4. a2+ b3\n5. a2+ b3",
  "1. a4=B b8=B\n2. b3=B+ Bc4\n3. c6=B+ Bf5\n4. c1=B+ B",
  "1. a2+ a3\n2. a2+ a3+\n3. a2+ a3+\n4. a2+ a3+\n5. a2+",
  "1. a3 b2\n2. c1 d2\n3. e3 f4\n4. g5 h6\n5. a1 b1\n6. a3",
  "1. a1 a2\n2. a1 b1\n3. a1 c1\n4. a1 d1\n5. a1 e1\n6. a1",
  "1. N2h4 a3\n2. N2h4 a3\n3. N2h4 a3\n4. N2h4 a3\n5. N2h4",
  "1. b2+ a2\n2. c2+ d2\n3. c4+ d4\n4. a3+ b3\n5. c7+ d7\n6. a",
  "1. N2a4+ b4\n2. N2b3+ c2\n3. a2 b2\n4. a2 b3\n5. a2 b2\n6. a",
  "1. N2xg3+ N4xg5+\n2. N2xg3+ N4xg5+\n3. N2xg3+ N4xg5+\n4. N2",
  "1. a1+ b2=N\n2. a1+ b2=N\n3. a1+ b2=N\n4. a1+ b2=N\n5. a1+ b2",
  "1. N1xh1 N2xh2\n2. h1+ h2+\n3. h1+ h2+\n4. h1+ h2+\n5. h1+ h2+",
  "1. b4 b3\n2. a5 a4\n3. a3 a4\n4. a4 b4\n5. a2 a1\n6. a4 a3\n7. a",
  "1. a1+ b2\n2. a1+ b2\n3. a1+ b2\n4. a1+ b2\n5. a1+ b2\n6. a1+ b2",
  "1. a2+ a3\n2. a1+ a2+\n3. a1+ a2+\n4. a1+ a2+\n5. a1+ a2+\n6. a1+",
  "1. N2xh2+ N3xh3+\n2. N2xh2+ N3xh3+\n3. N2xh2+ N3xh3+\n4. N2xh2+ N",
  "1. a1+ a2+\n2. b1+ b2+\n3. c1+ c2+\n4. d1+ d2+\n5. e1+ e2+\n6. f1+ f",
  "1. a1+ a2+\n2. c1=B+ Bxc2\n3. a2+ bxb2=B+\n4. a2+ bxb2=B+\n5. a2+ b",
  "1. a2+ b3+\n2. a2+ b4+\n3. a2+ b5+\n4. a2+ b6+\n5. a2+ b7+\n6. a2+ b8+\n7.",
  "1. a1+ a2=B\n2. b1+ b2=B\n3. c1+ c2=B\n4. d1+ d2=B\n5. e1+ e2=B\n6. f1+ f",
  "1. a2+ b2\n2. a2+ b2\n3. a2+ b2\n4. a2+ b2\n5. a2+ b2\n6. a2+ b2\n7. a2+ b2\n8",
  "1. N2xg3+ c4\n2. a5+ b6=N\n3. b7+ c8=N\n4. c1+ d2=N\n5. e3+ f4=N\n6. g5+ h6=N",
  "1. a1 a2\n2. a1 a2+\n3. a1+ a2\n4. a1 a2=B\n5. a1+ a2=B\n6. b1 a1\n7. b1 a2=B\n8",
  "1. N1xa1+ N2xa2\n2. b3=N+ Nb3\n3. N1xa1+ b3\n4. N1xa1+ N2xa2+\n5. N1xa1+ b3+\n6",
  "1. a2+ b3\n2. a1+ b2\n3. a1+ b2\n4. a1+ b2\n5. a1+ b2\n6. a1+ b2\n7. a1+ b2\n8. a1",
  "1. a2+ b2\n2. a3+ b3\n3. a4+ b4\n4. a5+ b5\n5. a6+ b6\n6. a7+ b7\n7. a8+ b8\n8. a8+ b",
  "1. Rea2 h5\n2. f2 g3\n3. h4 h4\n4. f3 h3\n5. h6 h8\n6. g7 g7\n7. g2 h4\n8. h7 h6\n9. h7 h"
]
