import { useParams } from 'react-router-dom';

export default function GamePage() {
  const { characterId } = useParams<{ characterId: string }>();

  return (
    <div>
      <h1>Game</h1>
      <p>Game page for character: {characterId || 'unknown'}</p>
    </div>
  );
}
