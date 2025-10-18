export default function calculateWinner(squares) {
  // Replace empty/null cells with '-' for easier regex matching
  const str = squares.map(s => (s ? s : '-')).join('');

  const re =
    /^(?:(?:...){0,2}([OX])\1\1|.{0,2}([OX])..\2..\2|([OX])...\3...\3|..([OX]).\4.\4)/g;

  const match = re.exec(str);

  if (match) {
    // Return whichever capture group matched first
    return match[1] || match[2] || match[3] || match[4];
  }

  return null;
}
